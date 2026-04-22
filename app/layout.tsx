import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { BackgroundMusic } from "@/components/BackgroundMusic";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Arc Trivia 1.0",
  description: "The official Arc Network blockchain quiz game. Play once. Earn your SBT.",
  icons: { icon: "/logo.png", apple: "/logo.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#050510] text-white min-h-screen`}>
        <Providers>
          {children}
          <BackgroundMusic />
          <p className="fixed bottom-2 left-1/2 -translate-x-1/2 text-[11px] text-indigo-200/20 pointer-events-none select-none z-40 whitespace-nowrap">
            Powered by Arc Testnet
          </p>
        </Providers>
      </body>
    </html>
  );
}
