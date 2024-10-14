const { ethers } = require("hardhat");
require("dotenv").config();
const { uploadToPinata } = require("./pinataIntegration");
const fs = require("fs");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Using account:", deployer.address);

    // Check if the file path and metadata are provided as arguments
    const [filePath, title, dateOfJudgment, caseNumber, category, judgeName] = process.argv.slice(2);
    
    if (!filePath || !title || !dateOfJudgment || !caseNumber || !category || !judgeName) {
        console.error("Please provide all required arguments: filePath, title, dateOfJudgment, caseNumber, category, judgeName");
        process.exit(1);
    }

    // Create a readable file stream from the file path
    const fileStream = fs.createReadStream(filePath);

    // Upload the file to Pinata and get the IPFS hash
    const ipfsHash = await uploadToPinata(fileStream, filePath); // Pass the file stream and file name
    console.log("IPFS Hash from Pinata:", ipfsHash);

    // Load your contract
    const EVault = await ethers.getContractFactory("EVault");
    const eVault = await EVault.attach(process.env.NAVINEVAULT_CONTRACT_ADDRESS);

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
