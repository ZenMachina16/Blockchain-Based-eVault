// scripts/storeHashInContract.js

const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Storing hash with the account:", deployer.address);

    // Load your contract
    const DocumentStorage = await ethers.getContractFactory("DocumentStorage");
    const documentStorage = await DocumentStorage.attach(process.env.CONTRACT_ADDRESS); // Ensure CONTRACT_ADDRESS is in .env

    // Replace with the IPFS hash you want to store
    const ipfsHash = "QmZUui2Tm9KVgXdFB47ko1tKt6Z1fSMbatN3wkhzdYnMJM";

    console.log("Calling uploadDocument with IPFS hash:", ipfsHash);
    const tx = await documentStorage.uploadDocument(ipfsHash);

    console.log("Transaction sent. Hash:", tx.hash);

    // Wait for the transaction to be mined
    const receipt = await tx.wait();

    console.log("Transaction mined in block:", receipt.blockNumber);
    console.log("Transaction confirmed at:", new Date().toISOString()); // Current time as fallback

    // Log all events
    receipt.logs.forEach((log, index) => {
        console.log(`Log ${index + 1}:`, log);
    });

    // Decode the logs to get the events
    const iface = new ethers.utils.Interface([
        "event DocumentUploaded(address indexed user, string ipfsHash)"
    ]);

    receipt.logs.forEach((log, index) => {
        try {
            const parsedLog = iface.parseLog(log);
            console.log(`Parsed Log ${index + 1}:`, parsedLog);
        } catch (e) {
            console.log(`Log ${index + 1} parsing error:`, e);
        }
    });

    console.log("Document hash stored successfully!");
}

main().catch((error) => {
    console.error("Error:", error);
    process.exitCode = 1;
});
