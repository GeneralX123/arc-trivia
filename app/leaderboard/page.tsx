"use client";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { GameBackground } from "@/components/GameBackground";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import Image from "next/image";
import { TIERS } from "@/lib/tiers";

type Entry = { id: number; name: string; image: string; count: number };

export default function LeaderboardPage() {
  const { status } = useAccount();
  const router = useRouter();
  const [data, setData] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "disconnected") { router.push("/"); return; }
  }, [status, router]);

  useEffect(() => {
    fetch("/api/leaderboard").then(r => r.json()).then(d => { setData(d.leaderboard); setLoading(false); });
  }, []);

  const total = data.reduce((a, t) => a + t.count, 0);

  const scoreRange = (id: number) => {
    const t = TIERS.find(t => t.id === id);
    return t ? `${t.min}–${t.max}` : "";
  };

  return (
    <>
      <GameBackground />
      <Sidebar />
      <TopBar />
      <main className="min-h-screen pl-16 pt-14 flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg space-y-5">
          <div className="text-center">
            <h1 className="text-3xl font-black mb-1">Arc Cohorts</h1>
            <p className="text-indigo-200/50 text-sm">{total} player{total !== 1 ? "s" : ""} have completed Arc Trivia 1.0</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {data.map((tier) => (
                <div key={tier.id} className="glass-card flex items-center gap-4 p-4">
                  <Image src={tier.image} alt={tier.name} width={56} height={56} className="object-contain flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-bold">{tier.name}</p>
                    <p className="text-xs text-indigo-200/40 mt-0.5">Score: {scoreRange(tier.id)}/20</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-indigo-400">{tier.count}</p>
                    <p className="text-xs text-indigo-200/40">players</p>
                  </div>
                </div>
              ))}
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
