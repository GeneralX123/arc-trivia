import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Dev-only reset endpoint — clears a player's Supabase record so they can replay
// Call with: POST /api/admin/reset { wallet: "0x..." }
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const { wallet } = await req.json();
  if (!wallet) return NextResponse.json({ error: "wallet required" }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("players")
    .delete()
    .eq("wallet_address", wallet.toLowerCase());

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, message: `Reset ${wallet}` });
}
