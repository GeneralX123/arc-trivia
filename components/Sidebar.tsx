"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const NAV = [
  { href: "/game", icon: "▶", label: "Play" },
  { href: "/profile", icon: "👤", label: "Profile" },
  { href: "/leaderboard", icon: "🏆", label: "Ranks" },
];

export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="fixed left-0 top-0 h-full w-16 flex flex-col items-center py-6 gap-2 z-40"
      style={{ background: "rgba(5,5,20,0.8)", borderRight: "1px solid rgba(99,102,241,0.15)", backdropFilter: "blur(12px)" }}>
      {/* Logo */}
      <Link href="/" className="mb-6">
        <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center bg-indigo-600">
          <Image src="/logo.png" alt="Arc Trivia" width={36} height={36} className="object-contain" />
        </div>
      </Link>
      {NAV.map((n) => {
        const active = path === n.href;
        return (
          <Link key={n.href} href={n.href}
            className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all text-lg
              ${active ? "bg-indigo-600 shadow-lg shadow-indigo-900" : "hover:bg-indigo-950/60 text-indigo-400"}`}
            title={n.label}
          >
            <span>{n.icon}</span>
          </Link>
        );
      })}

      {/* Learn more about Arc */}
      <div className="mt-auto flex flex-col items-center gap-2 pb-2">
        <span className="text-[8px] text-indigo-400/40 uppercase tracking-widest text-center leading-tight px-1">Learn<br/>Arc</span>
        <a href="https://x.com/arcnetwork_" target="_blank" rel="noopener noreferrer"
          title="Arc X Page"
          className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-indigo-950/60 text-indigo-400 transition-all text-base">
          𝕏
        </a>
        <a href="https://arc.network" target="_blank" rel="noopener noreferrer"
          title="Arc Website"
          className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-indigo-950/60 text-indigo-400 transition-all text-base">
          🌐
        </a>
      </div>
    </aside>
  );
}
