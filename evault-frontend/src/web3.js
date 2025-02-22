// src/web3.js
import Web3 from "web3";
import yourContractABI from "./contractABI"; // Import your contract ABI

const web3 = new Web3(window.ethereum); // Initialize Web3 with MetaMask provider

// Replace with your contract address
const contractAddress = process.env.REACT_APP_NAVINEVAULT_CONTRACT_ADDRESS; // Use an environment variable for the contract address

const contract = new web3.eth.Contract(yourContractABI, contractAddress);

// Function to get the contract instance
export const getContractInstance = () => {
  return contract;
};

// Function to get the current account
export const getCurrentAccount = async () => {
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  return accounts[0]; // Return the first account
};

export default web3; // Optionally export the Web3 instance if needed elsewhere
