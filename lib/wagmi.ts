import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain } from "viem";
import { fallback, http } from "wagmi";

export const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.testnet.arc.network", "https://arc-testnet.drpc.org"] } },
  blockExplorers: {
    default: { name: "ArcScan", url: "https://testnet.arcscan.app" },
  },
  testnet: true,
});

export const wagmiConfig = getDefaultConfig({
  appName: "Arc Trivia",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [arcTestnet],
  transports: {
    [arcTestnet.id]: fallback([
      http("https://rpc.testnet.arc.network"),
      http("https://arc-testnet.drpc.org"),
    ]),
  },
  ssr: true,
});
