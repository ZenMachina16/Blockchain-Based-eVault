const { ethers } = require("hardhat"); // Import ethers from Hardhat for interacting with the blockchain
require("dotenv").config(); // Load environment variables from .env file
const FormData = require("form-data"); // Import FormData to handle file uploads
const axios = require("axios"); // Import axios for making HTTP requests

// Function to upload a file to Pinata
async function uploadToPinata(fileStream, fileName) {
    try {
        const pinataJwt = process.env.PINATA_JWT; // Your Pinata JWT
        const form = new FormData(); // Create a new FormData object
        form.append("file", fileStream, fileName); // Add the file to the form

        // Send a POST request to Pinata to upload the file
        const response = await axios.post(`https://api.pinata.cloud/pinning/pinFileToIPFS`, form, {
            headers: {
                ...form.getHeaders(), // Get headers from FormData
                Authorization: `Bearer ${pinataJwt}` // Include the JWT for authentication
            }
        });

        const ipfsHash = response.data.IpfsHash; // Extract the IPFS hash from the response
        console.log("Uploaded File:", response.data);
        return ipfsHash; // Return the IPFS hash for further processing
    } catch (error) {
        console.error("Error uploading file:", error);
        throw error; // Rethrow the error for handling in the calling function
    }
}

// Function to store the IPFS hash in the smart contract
async function storeHashInContract(ipfsHash, title, dateOfJudgment, caseNumber, category, judgeName, linkedClients) {
    const [deployer] = await ethers.getSigners(); // Get the deployer's account
    console.log("Storing hash with the account:", deployer.address);

    // Load your smart contract and attach to the deployed address
    const contractABI = require("../artifacts/contracts/NavinEvault.sol/NavinEvault.json").abi; // Adjust as necessary
    const contractAddress = process.env.NAVINEVAULT_CONTRACT_ADDRESS; // Your deployed contract address
    const documentStorage = await ethers.getContractFactory("NavinEvault"); // Replace with your contract's name
    const contract = await documentStorage.attach(contractAddress); // Attach to the contract

    // Call the contract method to store the hash
    console.log("Calling uploadFile with IPFS hash:", ipfsHash);
    const tx = await contract.connect(deployer).uploadFile(
        ipfsHash, 
        title,
        dateOfJudgment,
        caseNumber,
        category,
        judgeName,
        linkedClients
    );

    console.log("Transaction sent. Hash:", tx.hash);
    const receipt = await tx.wait(); // Wait for the transaction to be mined
    console.log("Transaction mined in block:", receipt.blockNumber);
    console.log("Document hash stored successfully!");
}

module.exports = {
    uploadToPinata,
    storeHashInContract,
};
