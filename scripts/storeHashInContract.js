// scripts/storeHashInContract.js

const { ethers } = require("hardhat");
require("dotenv").config();
const uploadFileToPinata = require("./pinataIntegration");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Storing hash with the account:", deployer.address);

    // Upload the file to Pinata and get the IPFS hash
    const ipfsHash = await uploadFileToPinata(); // Get the IPFS hash from Pinata
    console.log("IPFS Hash from Pinata:", ipfsHash);

    // Load your contract
    const DocumentStorage = await ethers.getContractFactory("DocumentStorage");
    const documentStorage = await DocumentStorage.attach(process.env.CONTRACT_ADDRESS); 

    // Store the IPFS hash in the smart contract
    console.log("Calling uploadDocument with IPFS hash:", ipfsHash);
    const tx = await documentStorage.uploadDocument(ipfsHash);
    console.log("Transaction sent. Hash:", tx.hash);

    const receipt = await tx.wait();
    console.log("Transaction mined in block:", receipt.blockNumber);
    console.log("Document hash stored successfully!");
}

main().catch((error) => {
    console.error("Error:", error);
    process.exitCode = 1;
});
