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

    // Get the address to make a court official from user input
    const addressToMakeOfficial = await getUserInput("Enter the address you want to make a court official: ");

    // Validate address format using regex
    const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(addressToMakeOfficial.trim());
    if (!isValidAddress) {
        console.error("Invalid address format. Please enter a valid Ethereum address.");
        process.exit(1);
    }

    const NavinEvault = await hre.ethers.getContractAt("NavinEvault", contractAddress, owner);

    // Check if the address is already a court official
    const isAlreadyOfficial = await NavinEvault.isCourtOfficial(addressToMakeOfficial.trim());
    if (isAlreadyOfficial) {
        console.log(`Address ${addressToMakeOfficial.trim()} is already a court official.`);
        process.exit(0); // Exit if already an official
    }

    // Check if the address is already a client
    const isClient = await NavinEvault.isClient(addressToMakeOfficial.trim());
    if (isClient) {
        console.error(`Address ${addressToMakeOfficial.trim()} is already a client and cannot be made a court official.`);
        process.exit(1); // Exit if the address is already a client
    }

    // Proceed to add the court official
    const tx = await NavinEvault.addCourtOfficial(addressToMakeOfficial.trim());
    await tx.wait();

    console.log(`Successfully added court official: ${addressToMakeOfficial.trim()}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
