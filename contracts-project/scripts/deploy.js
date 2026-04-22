const { ethers } = require("hardhat");
require("dotenv").config({ path: "../.env.local" });

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "USDC");

  const ArcTrivia = await ethers.getContractFactory("ArcTrivia");
  const contract = await ArcTrivia.deploy(deployer.address);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("\n✅ ArcTrivia deployed to:", address);
  console.log("\nAdd these to your .env.local:");
  console.log(`NEXT_PUBLIC_GAME_CONTRACT=${address}`);
  console.log(`NEXT_PUBLIC_SBT_CONTRACT=${address}`);
  console.log(`NEXT_PUBLIC_BACKEND_SIGNER_ADDRESS=${deployer.address}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
