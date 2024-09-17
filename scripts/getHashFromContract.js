// scripts/getHashFromContract.js

const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Fetching document hash with the account:", deployer.address);

    // Load your contract
    const DocumentStorage = await ethers.getContractFactory("DocumentStorage");
    const documentStorage = await DocumentStorage.attach(process.env.CONTRACT_ADDRESS); // Ensure CONTRACT_ADDRESS is in .env

    // Fetch the document hash for the deployer's address
    const documentHash = await documentStorage.getDocumentHash(deployer.address);
    
    if (documentHash) {
        console.log("Fetched document hash:", documentHash);
    } else {
        console.log("No document hash found for this address.");
    }
}

main().catch((error) => {
    console.error("Error:", error);
    process.exitCode = 1;
});
