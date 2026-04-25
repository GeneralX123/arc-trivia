"use client";
import { useRouter } from "next/navigation";
import { getTierForScore } from "@/lib/tiers";
import { GameBackground } from "@/components/GameBackground";
import Image from "next/image";

type Player = { score: number; tier_name: string | null; x_username: string | null } | null;

export default function ShareClient({ player, wallet }: { player: Player; wallet: string }) {
  const router = useRouter();

  if (!player) {
    return (
      <>
        <GameBackground />
        <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center space-y-4">
          <p className="text-indigo-200/60">No result found for this wallet.</p>
          <button onClick={() => router.push("/")} className="btn-primary">Play Arc Trivia →</button>
        </main>
      </>
    );
  }

  const tier = getTierForScore(player.score);
  const shareText = encodeURIComponent(
    `I just completed Arc Trivia 1.0 and earned the "${tier.name}" SBT! 🎮\n\nAre you an Arc Maxi? Go Try it now`
  );
  const shareUrl = encodeURIComponent(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/share/${wallet}`);

  return (
    <>
      <GameBackground />
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm text-center space-y-5">
          <p className="text-xs text-indigo-400/60 uppercase tracking-widest">Arc Trivia 1.0 Result</p>
          {player.x_username && <p className="text-indigo-300 font-semibold text-lg">@{player.x_username}</p>}

          <div className="glass-card p-6 space-y-4">
            <Image src={tier.image} alt={tier.name} width={160} height={160} className="mx-auto object-contain" />
            <p className="text-2xl font-bold text-indigo-300">{tier.name}</p>
            <p className="text-5xl font-black">{player.score}<span className="text-indigo-400 text-2xl">/20</span></p>
          </div>

          <button onClick={() => router.push("/")} className="btn-primary w-full">
            Play Arc Trivia 1.0 →
          </button>

          <a
            href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full border border-zinc-700 hover:border-zinc-500 text-white py-3 rounded-xl transition text-sm"
          >
            <span className="font-bold">𝕏</span> Share on X
          </a>
        </div>
      </main>

      <style>{`
        .glass-card {
          background: rgba(10,10,30,0.7);
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 1rem;
          backdrop-filter: blur(16px);
        }
        .btn-primary {
          display: block;
          background: #4f46e5;
          color: white;
          font-weight: 700;
          padding: 12px 24px;
          border-radius: 12px;
          text-align: center;
          transition: background 0.15s;
        }
        .btn-primary:hover { background: #4338ca; }
      `}</style>
    </>
  );
}
