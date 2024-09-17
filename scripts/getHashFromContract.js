const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    const [deployer] = await ethers.getSigners();

    // Load your contract
    const DocumentStorage = await ethers.getContractFactory("DocumentStorage");
    const documentStorage = await DocumentStorage.attach(process.env.CONTRACT_ADDRESS); // Ensure CONTRACT_ADDRESS is in .env

    // Fetch the document hash for the deployer's address
    const documentHash = await documentStorage.getDocumentHash(deployer.address);

    // Output JSON directly
    console.log(JSON.stringify({ documentHash: documentHash || null }));
}

main().catch((error) => {
    // Output errors in JSON format
    console.error(JSON.stringify({ error: error.message }));
    process.exitCode = 1;
});
