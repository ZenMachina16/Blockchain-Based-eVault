const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    const [deployer] = await ethers.getSigners();

    // Load your contract
    const EVault = await ethers.getContractFactory("NavinEvault"); // Make sure this matches your contract name
    const eVault = await EVault.attach(process.env.NAVINEVAULT_CONTRACT_ADDRESS); // Ensure NEWEVAULT_CONTRACT_ADDRESS is in .env

    // Get the fileId from command line arguments
    const fileId = process.argv[2]; // Fetch the fileId from command line arguments

    if (!fileId) {
        console.error(JSON.stringify({ error: "Please provide a file ID." }));
        process.exit(1);
    }

    // Fetch the document with the specified fileId
    try {
        const caseFile = await eVault.getFile(fileId); // Call the getFile function

        // Output JSON with document details
        console.log(JSON.stringify({
            uploader: caseFile[0],
            ipfsHash: caseFile[1],
            title: caseFile[2],
            dateOfJudgment: caseFile[3],
            caseNumber: caseFile[4],
            category: caseFile[5],
            judgeName: caseFile[6],
            timestamp: caseFile[7]
        }));
    } catch (error) {
        console.error(JSON.stringify({ error: error.message }));
        process.exit(1);
    }
}

// Execute the main function
main().catch((error) => {
    console.error(JSON.stringify({ error: error.message }));
    process.exitCode = 1;
});
