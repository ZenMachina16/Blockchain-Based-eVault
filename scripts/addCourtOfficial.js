// scripts/addCourtOfficial.js
const { ethers } = require("hardhat");
require("dotenv").config();

async function addCourtOfficial(courtOfficialAddress) {
    const [deployer] = await ethers.getSigners();
    console.log("Using account:", deployer.address);

    // Load your contract
    const EVault = await ethers.getContractFactory("NavinEvault");
    const eVault = await EVault.attach(process.env.NAVINEVAULT_CONTRACT_ADDRESS);

    // Add court official
    const tx = await eVault.addCourtOfficial(courtOfficialAddress);
    console.log("Transaction sent. Hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("Transaction mined in block:", receipt.blockNumber);
    return `Account ${courtOfficialAddress} added as court official successfully!`;
}

module.exports = addCourtOfficial;
