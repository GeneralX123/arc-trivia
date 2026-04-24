import { NextRequest, NextResponse } from "next/server";
import { TIERS } from "@/lib/tiers";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://arctrivia.vercel.app";

const DESCRIPTIONS = [
  "Awarded to players who scored 0–2 on Arc Trivia 1.0. Your Arc journey is just beginning.",
  "Awarded to players who scored 3–5 on Arc Trivia 1.0. You're finding your footing in the Arc ecosystem.",
  "Awarded to players who scored 6–10 on Arc Trivia 1.0. You have solid knowledge of Arc and DeFi.",
  "Awarded to players who scored 11–15 on Arc Trivia 1.0. A well-versed navigator of the Arc ecosystem.",
  "Awarded to players who scored 16–19 on Arc Trivia 1.0. A near-perfect Arc expert.",
  "Awarded to players who scored 20/20 on Arc Trivia 1.0. A true Arc Maxi — perfect score.",
];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ tierId: string }> }
) {
  const { tierId } = await params;
  const id = parseInt(tierId);
  const tier = TIERS[id];

  if (!tier) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 404 });
  }

  const metadata = {
    name: tier.name,
    description: DESCRIPTIONS[id],
    image: `${BASE_URL}${tier.image}`,
    external_url: BASE_URL,
    attributes: [
      { trait_type: "Tier", value: tier.name },
      { trait_type: "Tier ID", value: tier.id },
      { trait_type: "Score Range", value: tier.id === 5 ? "20/20" : `${tier.min}–${tier.max}/20` },
      { trait_type: "Game", value: "Arc Trivia 1.0" },
      { trait_type: "Network", value: "Arc Testnet" },
    ],
  };

  return NextResponse.json(metadata, {
    headers: { "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
