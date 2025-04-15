require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ignition");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */

// Check if environment variables are defined
const SEPOLIA_URL = process.env.SEPOLIA_URL || "https://eth-sepolia.g.alchemy.com/v2/your-api-key";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";

module.exports = {
  solidity: {
    version: "0.8.24", // Or your specific version
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true
    }
  },
  networks: {
    sepolia: {
      url: SEPOLIA_URL,
      accounts: [PRIVATE_KEY],
      // No need to specify gas or gasLimit; it will be auto-estimated
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    }
  },
  ignition: {
    networks: {
      sepolia: {
        url: SEPOLIA_URL,
        accounts: [PRIVATE_KEY],
      },
      localhost: {
        url: "http://127.0.0.1:8545",
        chainId: 31337
      }
    },
  },
};
