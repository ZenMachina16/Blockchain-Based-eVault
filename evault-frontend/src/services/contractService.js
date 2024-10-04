// src/services/contractService.js

import Web3 from 'web3';
import { NavinEvaultABI } from '../contractABI'; // Adjusted import to match export style

// Initialize Web3 instance
const web3 = new Web3(Web3.givenProvider || 'http://localhost:8545');

// Use the environment variable for the contract address
const contractAddress = process.env.REACT_APP_NAVINEVAULT_CONTRACT_ADDRESS; // Ensure this is set in your .env file

// Create contract instance
const contract = new web3.eth.Contract(NavinEvaultABI, contractAddress);

// Function to fetch documents linked to the user
export const fetchDocumentsFromContract = async () => {
    try {
        const accounts = await web3.eth.getAccounts(); // Get the current user's accounts

        // Call the smart contract method to get documents
        const documents = await contract.methods.getDocuments().call({ from: accounts[0] }); // Ensure your contract has this method

        // Assuming documents returned from the contract has a structure { hash, name }
        return documents.map((doc) => ({
            name: doc.name,
            hash: doc.hash,
        }));
    } catch (error) {
        console.error("Error fetching documents:", error);
        return [];
    }
};
