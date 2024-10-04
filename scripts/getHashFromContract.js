// getHashFromContract.js
const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    const [deployer] = await ethers.getSigners();

    // Load your contract
    const EVault = await ethers.getContractFactory("NavinEvault");
    const eVault = await EVault.attach(process.env.NAVINEVAULT_CONTRACT_ADDRESS);

    const fileId = 1;  // Replace with actual file ID
    const caseFile = await eVault.getFile(fileId);

    console.log(`File ID: ${fileId}`);
    console.log(`Title: ${caseFile.title}`);
    console.log(`IPFS Hash: ${caseFile.ipfsHash}`);
    console.log(`Uploader: ${caseFile.uploader}`);
    console.log(`Date of Judgment: ${caseFile.dateOfJudgment}`);
    console.log(`Case Number: ${caseFile.caseNumber}`);
    console.log(`Category: ${caseFile.category}`);
    console.log(`Judge Name: ${caseFile.judgeName}`);
    console.log(`Linked Clients: ${caseFile.linkedClients}`);
}

main().catch((error) => {
    console.error("Error:", error);
    process.exitCode = 1;
});
