"use client";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useAccount } from "wagmi";

export function TopBar() {
  const { data: session } = useSession();
  const { address } = useAccount();
  const short = address ? `${address.slice(0, 5)}...${address.slice(-4)}` : null;

  return (
    <header className="fixed top-0 left-16 right-0 h-14 flex items-center justify-between px-6 z-30"
      style={{ background: "rgba(5,5,20,0.85)", borderBottom: "1px solid rgba(99,102,241,0.15)", backdropFilter: "blur(12px)" }}>
      {/* Brand */}
      <Link href="/" className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg overflow-hidden bg-indigo-600 flex items-center justify-center">
          <Image src="/logo.png" alt="Arc Trivia" width={28} height={28} className="object-contain" />
        </div>
        <span className="font-black text-lg tracking-tight">Arc<span className="text-indigo-400">Trivia</span></span>
        <span className="text-xs text-indigo-400/60 font-medium ml-1">1.0</span>
      </Link>

      {/* User info */}
      {(session?.user?.xUsername || short) && (
        <div className="flex items-center gap-3">
          {session?.user?.xUsername && (
            <span className="text-sm text-indigo-300 font-medium">@{session.user.xUsername}</span>
          )}
          {short && (
            <span className="text-xs font-mono bg-indigo-950/60 border border-indigo-500/20 text-indigo-400 px-2.5 py-1 rounded-lg">
              {short}
            </span>
          )}
        </div>
      )}
    </header>
  );
}
