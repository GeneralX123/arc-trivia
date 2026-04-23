import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.xUsername) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const walletAddress = searchParams.get("wallet");
  if (!walletAddress) {
    return NextResponse.json({ error: "Wallet required" }, { status: 400 });
  }

  const { data: player } = await supabaseAdmin
    .from("players")
    .select("score, tier_id, tier_name, game_completed")
    .eq("wallet_address", walletAddress.toLowerCase())
    .single();

  if (!player) return NextResponse.json({ played: false });

  return NextResponse.json({
    played: player.game_completed,
    score: player.score ?? 0,
    tierId: player.tier_id ?? 0,
    tierName: player.tier_name ?? "",
  });
}
