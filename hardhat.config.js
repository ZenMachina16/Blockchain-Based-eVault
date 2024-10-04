require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ignition");
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
  solidity: {
    version: "0.8.24", // Or your specific version
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_URL, // Your Alchemy or Infura URL
      accounts: [process.env.PRIVATE_KEY], // Your wallet's private key
      // No need to specify gas or gasLimit; it will be auto-estimated
    }
  },
  ignition: {
    networks: {
      sepolia: {
        url: process.env.SEPOLIA_URL, // Your Alchemy or Infura URL
        accounts: [process.env.PRIVATE_KEY] // Your wallet's private key
      }
    }
  },
};
