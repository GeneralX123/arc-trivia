"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { GameBackground } from "@/components/GameBackground";
import Image from "next/image";

export default function LandingPage() {
  const { isConnected } = useAccount();
  const { data: session } = useSession();
  const router = useRouter();


  return (
    <>
      <GameBackground />
      {/* Decorative logos */}
      <div className="fixed left-0 top-1/2 -translate-y-1/2 -translate-x-1/4 opacity-[0.06] pointer-events-none select-none">
        <Image src="/logo.png" alt="" width={400} height={400} className="object-contain" />
      </div>
      <div className="fixed right-0 top-1/2 -translate-y-1/2 translate-x-1/4 opacity-[0.06] pointer-events-none select-none">
        <Image src="/arc-logo.png" alt="" width={400} height={400} className="object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
      </div>

      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md text-center space-y-7">

          {/* Logo + title */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-900/50">
              <Image src="/logo.png" alt="Arc Trivia" width={80} height={80} className="object-contain" />
            </div>
            <h1 className="text-5xl font-black tracking-tight">
              Arc<span className="text-indigo-400">Trivia</span>
              <span className="text-indigo-500/60 text-3xl ml-1">1.0</span>
            </h1>
            <p className="text-indigo-200/70 text-lg font-medium">
              Are you an Arc Maxi?
            </p>
            <p className="text-indigo-200/50 text-sm font-medium">
              Test your knowledge of Circle, Arc Network and DeFi
            </p>
          </div>

          {/* Pills */}
          <div className="flex justify-center gap-2 flex-wrap">
            {["20 Questions", "Ranked SBTs", "One Try Only"].map((s) => (
              <span key={s} className="bg-indigo-950/60 border border-indigo-500/20 text-indigo-300 text-xs px-3 py-1.5 rounded-full">
                {s}
              </span>
            ))}
          </div>

          {/* Connect steps */}
          <div className="glass-card p-6 space-y-5 text-left">
            {/* Step 1 */}
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 transition-all
                ${isConnected ? "bg-green-500 shadow-lg shadow-green-900" : "bg-indigo-600"}`}>
                {isConnected ? "✓" : "1"}
              </div>
              <div className="flex-1">
                <p className="text-xs text-indigo-400/60 uppercase tracking-widest mb-2">Connect Wallet</p>
                <ConnectButton showBalance={false} />
              </div>
            </div>

            <div className="border-t border-indigo-500/10" />

            {/* Step 2 */}
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 transition-all
                ${session?.user?.xUsername ? "bg-green-500 shadow-lg shadow-green-900" : isConnected ? "bg-indigo-600" : "bg-indigo-950/80"}`}>
                {session?.user?.xUsername ? "✓" : "2"}
              </div>
              <div className="flex-1">
                <p className="text-xs text-indigo-400/60 uppercase tracking-widest mb-2">Connect X Account</p>
                {session?.user?.xUsername ? (
                  <p className="text-green-400 font-semibold">@{session.user.xUsername}</p>
                ) : (
                  <button onClick={() => signIn("twitter")} disabled={!isConnected}
                    className="flex items-center gap-2 bg-black hover:bg-zinc-900 border border-zinc-700 text-white text-sm px-4 py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition">
                    <span className="font-bold text-base">𝕏</span> Sign in with X
                  </button>
                )}
              </div>
            </div>
          </div>

          {isConnected && session?.user?.xUsername && (
            <button onClick={() => router.push("/game")} className="btn-primary text-lg py-4">
              Enter the Trivia →
            </button>
          )}

          <p className="text-xs text-indigo-200/30">Entry fee: 2 USDC (testnet)</p>
        </div>
      </main>
    </>
  );
}
