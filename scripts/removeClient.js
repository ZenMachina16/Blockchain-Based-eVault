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

    // Get the address to remove from clients from user input
    const addressToRemove = await getUserInput("Enter the address you want to remove as a client: ");

    // Validate address format using regex
    const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(addressToRemove.trim());
    if (!isValidAddress) {
        console.error("Invalid address format. Please enter a valid Ethereum address.");
        process.exit(1);
    }

    // Check if the address is a client
    const NavinEvault = await hre.ethers.getContractAt("NavinEvault", contractAddress, owner);
    const isClient = await NavinEvault.isClient(addressToRemove.trim());

    if (!isClient) {
        console.log(`Address ${addressToRemove.trim()} is not a registered client.`);
        process.exit(0);
    }

    // Remove client
    const tx = await NavinEvault.removeClient(addressToRemove.trim());
    await tx.wait();

    console.log(`Successfully removed client: ${addressToRemove.trim()}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
