const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    const [deployer] = await ethers.getSigners();

    // Load your contract
    const EVault = await ethers.getContractFactory("EVault");
    const eVault = await EVault.attach(process.env.NEWEVAULT_CONTRACT_ADDRESS); // Ensure EVAULT_CONTRACT_ADDRESS is in .env

    // Example: Fetch the document with fileId = 1 (you can change this dynamically)
    const fileId = 1; // Replace with the actual fileId you want to fetch
    const caseFile = await eVault.caseFiles(fileId);

    // Output JSON with document details
    console.log(JSON.stringify({
        uploader: caseFile.uploader,
        ipfsHash: caseFile.ipfsHash,
        title: caseFile.title,
        dateOfJudgment: caseFile.dateOfJudgment,
        caseNumber: caseFile.caseNumber,
        category: caseFile.category,
        judgeName: caseFile.judgeName,
        timestamp: caseFile.timestamp
    }));
}

main().catch((error) => {
    // Output errors in JSON format
    console.error(JSON.stringify({ error: error.message }));
    process.exitCode = 1;
});
