require('dotenv').config(); // Load environment variables
const hre = require("hardhat");
const readline = require("readline");

// Function to get user input from the command line
function getUserInput(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => rl.question(question, (answer) => {
        rl.close();
        resolve(answer);
    }));
}

async function main() {
    const contractAddress = process.env.NAVINEVAULT_CONTRACT_ADDRESS; // Read from .env
    const [owner] = await hre.ethers.getSigners(); // Use the first account as the owner

    // Get the address to remove from court officials from user input
    const addressToRemove = await getUserInput("Enter the address you want to remove as a court official: ");

    // Validate address format using regex
    const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(addressToRemove.trim());
    if (!isValidAddress) {
        console.error("Invalid address format. Please enter a valid Ethereum address.");
        process.exit(1);
    }

    // Check if the address is a court official
    const NavinEvault = await hre.ethers.getContractAt("NavinEvault", contractAddress, owner);
    const isCourtOfficial = await NavinEvault.isCourtOfficial(addressToRemove.trim());
    
    if (!isCourtOfficial) {
        console.log(`Address ${addressToRemove.trim()} is not a court official.`);
        process.exit(0);
    }

    // Remove court official
    const tx = await NavinEvault.removeCourtOfficial(addressToRemove.trim());
    await tx.wait();

    console.log(`Successfully removed court official: ${addressToRemove.trim()}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
