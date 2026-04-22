import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  const playerAddress = process.argv[2];
  if (!playerAddress) { console.error("Usage: npx hardhat run scripts/reset-player.ts --network arcTestnet <wallet>"); process.exit(1); }

  const [owner] = await ethers.getSigners();
  const contractAddress = process.env.NEXT_PUBLIC_GAME_CONTRACT!;
  const abi = ["function resetPlayer(address player) external"];
  const contract = new ethers.Contract(contractAddress, abi, owner);

  console.log(`Resetting ${playerAddress} on contract ${contractAddress}...`);
  const tx = await contract.resetPlayer(playerAddress);
  await tx.wait();
  console.log("✅ Player reset on contract. Tx:", tx.hash);
}

main().catch((e) => { console.error(e); process.exit(1); });
