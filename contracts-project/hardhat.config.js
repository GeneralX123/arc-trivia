require("@nomicfoundation/hardhat-ethers");
require("dotenv").config({ path: "../.env.local" });

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  networks: {
    arcTestnet: {
      url: "https://rpc.testnet.arc.network",
      chainId: 5042002,
      accounts: process.env.BACKEND_SIGNER_PRIVATE_KEY
        ? [process.env.BACKEND_SIGNER_PRIVATE_KEY]
        : [],
    },
  },
};
