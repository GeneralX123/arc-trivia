import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { ethers } from "ethers";
import { getTierForScore } from "@/lib/tiers";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.xUsername) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { walletAddress } = await req.json();

  const { data: player } = await supabaseAdmin
    .from("players")
    .select("score, game_completed, sbt_minted")
    .eq("wallet_address", walletAddress.toLowerCase())
    .single();

  if (!player) return NextResponse.json({ error: "Player not found" }, { status: 404 });

  const score = player.score;
  const tier = getTierForScore(score);

  // Mark game completed
  await supabaseAdmin
    .from("players")
    .update({ game_completed: true, tier_id: tier.id, tier_name: tier.name })
    .eq("wallet_address", walletAddress.toLowerCase());

  // Sign mint authorization for the smart contract
  const signer = new ethers.Wallet(process.env.BACKEND_SIGNER_PRIVATE_KEY!);
  const messageHash = ethers.solidityPackedKeccak256(
    ["address", "uint8", "uint8"],
    [walletAddress, score, tier.id]
  );
  const signature = await signer.signMessage(ethers.getBytes(messageHash));

  return NextResponse.json({ score, tier: tier.id, tierName: tier.name, signature, minted: !!player.sbt_minted });
}
