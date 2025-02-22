const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const [deployer] = await ethers.getSigners();

  // Load your contract
  const EVault = await ethers.getContractFactory("NavinEvault");
  const eVault = await EVault.attach(process.env.NAVINEVAULT_CONTRACT_ADDRESS);

  // Check total case files
  const totalFiles = await eVault.totalCaseFiles();
  console.log("Total case files: ", totalFiles.toString());

  // Use the most recent fileId or specify a specific fileId
  const fileId = totalFiles; // Linking to the most recently uploaded file

  // Example client addresses to link
  const clientsToLink = [
    "0x90F79bf6EB2c4f870365E785982E1f101E93b906", // Account #3
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // Account #2
  ];

  try {
    // Filter out clients that are already linked
    const clientsNotLinked = [];

    for (const client of clientsToLink) {
      const isLinked = await eVault.linkedClientsMap(fileId, client);
      if (!isLinked) {
        clientsNotLinked.push(client);
      } else {
        console.log(
          `Client ${client} is already linked to file ID ${fileId}. Skipping.`,
        );
      }
    }

    // Proceed only if there are clients left to link
    if (clientsNotLinked.length > 0) {
      const tx = await eVault.linkClients(fileId, clientsNotLinked);
      console.log(`Transaction sent. Hash: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(
        `Clients successfully linked to file ID: ${fileId} in block: ${receipt.blockNumber}`,
      );
    } else {
      console.log("No new clients to link.");
    }
  } catch (error) {
    console.error("Error linking clients:", error.message);
  }
}

main().catch((error) => {
  console.error("Error in main:", error.message);
  process.exitCode = 1;
});
