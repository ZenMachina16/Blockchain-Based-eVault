// fetchCaseFiles.js

const { ethers } = require("hardhat");
require("dotenv").config();

async function fetchCaseFiles() {
  const [deployer] = await ethers.getSigners();
  console.log("Fetching case file with the account:", deployer.address);

  const NavinEvault = await ethers.getContractFactory("NavinEvault");
  const contract = await NavinEvault.attach(
    process.env.NAVINEVAULT_CONTRACT_ADDRESS,
  );

  try {
    const totalFiles = await contract.totalCaseFiles();
    console.log(`Total case files: ${totalFiles.toString()}`);
    console.log(`Type of totalFiles: ${typeof totalFiles}`);

    if (totalFiles === 0n) {
      console.log(
        "No case files exist. Please upload a case file before fetching.",
      );
      return { message: "No case files exist." };
    }

    const allCaseFiles = []; // Initialize an array to hold all case file data

    for (let i = 1; i <= totalFiles; i++) {
      const caseFile = await contract.getFile(i);
      const caseFileData = {
        caseNumber: caseFile.caseNumber.toString(),
        title: caseFile.title || "N/A",
        ipfsHash: caseFile.ipfsHash || null,
        dateOfJudgment: caseFile.dateOfJudgment || "N/A",
        category: caseFile.category || "N/A",
        judgeName: caseFile.judgeName || "N/A",
        linkedClients: caseFile.linkedClients || [],
        metadata: {
          uploader: caseFile.uploader || "N/A",
          timestamp: caseFile.timestamp.toString() || "N/A",
        },
      };

      allCaseFiles.push(caseFileData);
    }

    return {
      message: "Case files retrieved successfully",
      files: allCaseFiles,
    };
  } catch (error) {
    console.error(JSON.stringify({ error: error.message || error }));
    throw error; // Rethrow the error to handle it in the server
  }
}

module.exports = fetchCaseFiles; // Export the function
