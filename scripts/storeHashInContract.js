// scripts/storeHashInContract.js

const { ethers } = require("hardhat");
require("dotenv").config();
const uploadFileToPinata = require("./pinataIntegration");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Using account:", deployer.address);

    // Upload the file to Pinata and get the IPFS hash
    const ipfsHash = await uploadFileToPinata(); // Get the IPFS hash from Pinata
    console.log("IPFS Hash from Pinata:", ipfsHash);

    // Load your contract
    const EVault = await ethers.getContractFactory("EVault");
    const eVault = await EVault.attach(process.env.NEWEWEVAULT_CONTRACT_ADDRESS);

    // Prepare metadata to be stored
    const title = "Successful Case"; // Fixed typo
    const dateOfJudgment = "2024-09-21"; // Example date
    const caseNumber = "C-12346"; // Example case number
    const category = "Civil"; // Example category
    const judgeName = "Judge John Doe"; // Example judge name

    // Log the metadata being uploaded
    console.log("Uploading with metadata:", {
        ipfsHash,
        title,
        dateOfJudgment,
        caseNumber,
        category,
        judgeName
    });
    
    // Store the IPFS hash and metadata in the smart contract
    console.log("Calling uploadFile with IPFS hash and metadata...");
    
    const tx = await eVault.uploadFile(
        ipfsHash,
        title,
        dateOfJudgment,
        caseNumber,
        category,
        judgeName,
        { gasLimit: 50000000 } // Adjust gas limit as needed
    );

    console.log("Transaction sent. Hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("Transaction mined in block:", receipt.blockNumber);
    console.log("Document hash and metadata stored successfully!");
}

main().catch((error) => {
    console.error("Error:", error);
    process.exitCode = 1;
});
