import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { TIERS } from "@/lib/tiers";

export async function GET() {
  const { data } = await supabaseAdmin
    .from("players")
    .select("tier_id")
    .eq("game_completed", true);

  const counts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  data?.forEach((p) => { if (p.tier_id !== null) counts[p.tier_id]++; });

  const leaderboard = TIERS.map((t) => ({
    ...t,
    count: counts[t.id] ?? 0,
  })).reverse(); // Show highest tier first

  return NextResponse.json({ leaderboard });
}
