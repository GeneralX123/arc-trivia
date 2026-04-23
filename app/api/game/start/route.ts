import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.xUsername) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { walletAddress, checkOnly } = await req.json();
  if (!walletAddress) {
    return NextResponse.json({ error: "Wallet address required" }, { status: 400 });
  }

  // Check if player already has a completed game — by wallet OR by X username
  const { data: existingByWallet } = await supabaseAdmin
    .from("players")
    .select("*")
    .eq("wallet_address", walletAddress.toLowerCase())
    .maybeSingle();

  const { data: existingByX } = await supabaseAdmin
    .from("players")
    .select("*")
    .eq("x_username", session.user.xUsername)
    .eq("game_completed", true)
    .maybeSingle();

  // X account played on a different wallet
  if (existingByX && existingByX.wallet_address !== walletAddress.toLowerCase()) {
    return NextResponse.json({ error: "X account already used" }, { status: 403 });
  }

  const existing = existingByWallet ?? existingByX;

  if (existing?.game_completed) {
    return NextResponse.json({ error: "Already played" }, { status: 403 });
  }

  // Check if there's an abandoned session — finalize it
  if (existing?.game_started && !existing?.game_completed) {
    await supabaseAdmin
      .from("players")
      .update({ game_completed: true })
      .eq("wallet_address", walletAddress.toLowerCase());

    return NextResponse.json({ error: "Already played" }, { status: 403 });
  }

  if (checkOnly) {
    return NextResponse.json({ ok: true });
  }

  // Fetch all questions, shuffle in JS to ensure true randomness each attempt
  const { data: questions, error } = await supabaseAdmin
    .from("questions")
    .select("id, question, option_a, option_b, option_c, option_d");

  if (error || !questions) {
    return NextResponse.json({ error: "Failed to load questions" }, { status: 500 });
  }

  // Shuffle all questions, take 25 (20 active + 5 reserve for skip replacement)
  const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, 25);

  const prepareQuestion = (q: typeof questions[0]) => {
    const options = [
      { label: "A", text: q.option_a },
      { label: "B", text: q.option_b },
      { label: "C", text: q.option_c },
      { label: "D", text: q.option_d },
    ].sort(() => Math.random() - 0.5)
      .map((opt, i) => ({ ...opt, label: ["A", "B", "C", "D"][i] }));
    return { id: q.id, question: q.question, options };
  };

  const active = shuffled.slice(0, 20).map(prepareQuestion);
  const reserve = shuffled.slice(20).map(prepareQuestion);

  // Upsert player record — mark game as started
  await supabaseAdmin.from("players").upsert({
    wallet_address: walletAddress.toLowerCase(),
    x_username: session.user.xUsername,
    x_name: session.user.xName ?? session.user.xUsername,
    game_started: true,
    game_completed: false,
    score: 0,
    question_ids: shuffled.map((q) => q.id),
    current_question_index: 0,
  }, { onConflict: "wallet_address" });

  return NextResponse.json({ questions: active, reserve });
}
