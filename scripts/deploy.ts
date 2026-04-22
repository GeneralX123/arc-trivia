import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const backendSigner = deployer.address; // same wallet signs game results
  const ArcTrivia = await ethers.getContractFactory("ArcTrivia");
  const contract = await ArcTrivia.deploy(backendSigner);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("✅ ArcTrivia deployed to:", address);
  console.log("\nAdd this to your .env.local:");
  console.log(`NEXT_PUBLIC_GAME_CONTRACT=${address}`);
  console.log(`NEXT_PUBLIC_SBT_CONTRACT=${address}`);
  console.log(`NEXT_PUBLIC_BACKEND_SIGNER_ADDRESS=${deployer.address}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
