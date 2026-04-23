"use client";
import { useEffect, useState } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ARC_TRIVIA_ABI, CONTRACT_ADDRESS } from "@/lib/contract";
import { TIERS } from "@/lib/tiers";
import { GameBackground } from "@/components/GameBackground";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import Image from "next/image";

export default function ProfilePage() {
  const { address, isConnected, status } = useAccount();
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const { data: playerData } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ARC_TRIVIA_ABI,
    functionName: "players",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!CONTRACT_ADDRESS },
  });

  useEffect(() => {
    if (status === "disconnected") { router.push("/"); return; }
    if (status === "reconnecting" || status === "connecting") return;
    if (sessionStatus === "loading") return;
    if (!isConnected || !session?.user?.xUsername) router.push("/");
  }, [isConnected, session, router, status, sessionStatus]);

  const hasPaid = playerData?.[0];
  const hasMinted = playerData?.[1];
  const onChainScore = playerData?.[2] ?? 0;
  const onChainTierId = playerData?.[3] ?? 0;

  const [dbPlayer, setDbPlayer] = useState<{ played: boolean; score: number; tierId: number } | null>(null);

  useEffect(() => {
    if (!address || !session?.user?.xUsername) return;
    fetch(`/api/game/player?wallet=${address}`)
      .then(r => r.json())
      .then(d => setDbPlayer(d))
      .catch(() => {});
  }, [address, session]);

  const score = hasMinted ? onChainScore : (dbPlayer?.score ?? 0);
  const tierId = hasMinted ? onChainTierId : (dbPlayer?.tierId ?? 0);
  const hasPlayed = hasPaid || dbPlayer?.played;
  const tier = TIERS[tierId];

  const shareText = encodeURIComponent(
    `I played Arc Trivia 1.0 and earned the "${tier?.name}" SBT with a score of ${score}/20! 🎮 Are you an Arc Maxi? #ArcTrivia #ArcNetwork`
  );
  const shareUrl = encodeURIComponent(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/share/${address}`);

  return (
    <>
      <GameBackground />
      <Sidebar />
      <TopBar />
      <main className="min-h-screen pl-16 pt-14 flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-md space-y-5">
          <h1 className="text-2xl font-black text-center">Your Profile</h1>

          {/* Identity card */}
          <div className="glass-card p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-indigo-600/40 border border-indigo-500/30 flex items-center justify-center text-2xl flex-shrink-0">
              🧑
            </div>
            <div>
              <p className="font-bold text-lg">@{session?.user?.xUsername}</p>
              <p className="text-xs font-mono text-indigo-400/60">{address?.slice(0,6)}...{address?.slice(-4)}</p>
            </div>
          </div>

          {/* SBT Card */}
          {hasPlayed ? (
            <div className="glass-card p-6 text-center space-y-4">
              <p className="text-xs text-indigo-400 uppercase tracking-widest">Your Arc Trivia 1.0 SBT</p>
              {tier && <Image src={tier.image} alt={tier.name} width={160} height={160} className="mx-auto object-contain" />}
              <p className="text-2xl font-bold text-indigo-300">{tier?.name}</p>
              <p className="text-5xl font-black">{score}<span className="text-indigo-400 text-2xl">/20</span></p>
              {hasMinted
                ? <p className="text-green-400 text-sm font-semibold">✓ Minted on-chain</p>
                : <p className="text-yellow-400 text-sm">Not yet minted — go to game to mint</p>
              }
              <a href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full border border-zinc-700 hover:border-zinc-500 text-white py-3 rounded-xl transition text-sm">
                <span className="font-bold">𝕏</span> Share on X
              </a>
            </div>
          ) : (
            <div className="glass-card p-6 text-center space-y-4">
              <p className="text-indigo-200/60">You haven&apos;t played yet.</p>
              <button onClick={() => router.push("/game")} className="btn-primary">Play Now →</button>
            </div>
          )}
        </div>
      </main>

      <style>{`
        .glass-card {
          background: rgba(10,10,30,0.7);
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 1rem;
          backdrop-filter: blur(16px);
        }
      `}</style>
    </>
  );
}
