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

    // Get the address to make a client from user input
    const addressToAddClient = await getUserInput("Enter the address you want to add as a client: ");

    // Validate address format using regex
    const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(addressToAddClient.trim());
    if (!isValidAddress) {
        console.error("Invalid address format. Please enter a valid Ethereum address.");
        process.exit(1);
    }

    const NavinEvault = await hre.ethers.getContractAt("NavinEvault", contractAddress, owner);

    // Check if the address is already a court official
    const isCourtOfficial = await NavinEvault.isCourtOfficial(addressToAddClient.trim());
    if (isCourtOfficial) {
        console.error(`Address ${addressToAddClient.trim()} is already a court official and cannot be a client.`);
        process.exit(0); // Exit if already a court official
    }

    // Check if the address is already a client
    const isAlreadyClient = await NavinEvault.isClient(addressToAddClient.trim());
    
    if (isAlreadyClient) {
        console.log(`Address ${addressToAddClient.trim()} is already a client.`);
        process.exit(0);
    }

    // Add client
    const tx = await NavinEvault.addClient(addressToAddClient.trim());
    await tx.wait();

    console.log(`Successfully added client: ${addressToAddClient.trim()}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
