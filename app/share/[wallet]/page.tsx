import { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import { getTierForScore } from "@/lib/tiers";
import ShareClient from "./ShareClient";

type Props = { params: Promise<{ wallet: string }> };

async function getPlayer(wallet: string) {
  const { data } = await supabaseAdmin
    .from("players")
    .select("score, tier_name, x_username")
    .eq("wallet_address", wallet.toLowerCase())
    .single();
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { wallet } = await params;
  const player = await getPlayer(wallet);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  if (!player) {
    return { title: "Arc Trivia 1.0" };
  }

  const tier = getTierForScore(player.score);
  const ogUrl = `${baseUrl}/api/og?tierName=${encodeURIComponent(tier.name)}&score=${player.score}&user=${encodeURIComponent(player.x_username ?? "")}`;
  const title = `${player.x_username ? "@" + player.x_username + " is" : "Someone is"} a ${tier.name} on Arc Trivia 1.0`;
  const description = `Scored ${player.score}/20 and earned the ${tier.name} SBT. Can you beat them?`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogUrl],
    },
  };
}

export default async function SharePage({ params }: Props) {
  const { wallet } = await params;
  const player = await getPlayer(wallet);
  return <ShareClient player={player} wallet={wallet} />;
}
