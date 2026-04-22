import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.xUsername) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { walletAddress, questionId, selectedOptionText } = await req.json();

  const { data: player } = await supabaseAdmin
    .from("players")
    .select("score, current_question_index, question_ids, game_completed")
    .eq("wallet_address", walletAddress.toLowerCase())
    .single();

  if (!player || player.game_completed) {
    return NextResponse.json({ error: "No active game" }, { status: 403 });
  }

  // Check the correct answer from DB
  const { data: question } = await supabaseAdmin
    .from("questions")
    .select("correct_answer")
    .eq("id", questionId)
    .single();

  const isCorrect = question?.correct_answer === selectedOptionText;
  const newScore = isCorrect ? player.score + 1 : player.score;
  const newIndex = player.current_question_index + 1;

  await supabaseAdmin
    .from("players")
    .update({ score: newScore, current_question_index: newIndex })
    .eq("wallet_address", walletAddress.toLowerCase());

  return NextResponse.json({ correct: isCorrect, score: newScore, correctAnswer: question?.correct_answer });
}
