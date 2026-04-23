"use client";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useAccount, useDisconnect } from "wagmi";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export function TopBar() {
  const { data: session } = useSession();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const short = address ? `${address.slice(0, 5)}...${address.slice(-4)}` : null;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleDisconnect() {
    disconnect();
    signOut({ redirect: false });
    setOpen(false);
    router.push("/");
  }

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
            <div ref={ref} className="relative">
              <button onClick={() => setOpen(o => !o)}
                className="text-xs font-mono bg-indigo-950/60 border border-indigo-500/20 text-indigo-400 px-2.5 py-1 rounded-lg hover:border-indigo-500/50 transition flex items-center gap-1">
                {short}
                <span className="text-indigo-500 text-[10px]">{open ? "▲" : "▼"}</span>
              </button>
              {open && (
                <div className="absolute right-0 top-full mt-2 bg-[#0a0a1e] border border-indigo-500/20 rounded-xl shadow-xl overflow-hidden min-w-[140px]">
                  <button onClick={handleDisconnect}
                    className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-950/30 transition">
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
