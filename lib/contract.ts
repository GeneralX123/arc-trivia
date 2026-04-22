export const ARC_TRIVIA_ABI = [
  {
    name: "enterGame",
    type: "function",
    stateMutability: "payable",
    inputs: [],
    outputs: [],
  },
  {
    name: "mintSBT",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "score", type: "uint8" },
      { name: "tier", type: "uint8" },
      { name: "signature", type: "bytes" },
    ],
    outputs: [],
  },
  {
    name: "hasPlayed",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "player", type: "address" }],
    outputs: [{ type: "bool" }],
  },
  {
    name: "hasMinted",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "player", type: "address" }],
    outputs: [{ type: "bool" }],
  },
  {
    name: "players",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [
      { name: "hasPaid", type: "bool" },
      { name: "hasMinted", type: "bool" },
      { name: "score", type: "uint8" },
      { name: "tier", type: "uint8" },
      { name: "tokenId", type: "uint256" },
    ],
  },
  {
    name: "getTierCounts",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "counts", type: "uint256[6]" }],
  },
  {
    name: "ENTRY_FEE",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
] as const;

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_GAME_CONTRACT as `0x${string}`;
