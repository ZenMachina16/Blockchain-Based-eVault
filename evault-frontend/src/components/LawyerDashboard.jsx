import React from 'react';
import Web3 from 'web3';
import { NavinEvaultABI } from '../contractABI'; // Correctly import the ABI

const LawyerDashboard = () => {
    const handleAddCourtOfficial = async () => {
        const courtOfficialAddress = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"; // Replace with the actual address to be added

        // Check for Web3 provider
        if (typeof window.ethereum !== 'undefined') {
            const web3 = new Web3(window.ethereum);
            const accounts = await web3.eth.getAccounts();

            // Create contract instance
            const eVaultContract = new web3.eth.Contract(NavinEvaultABI, process.env.REACT_APP_NAVINEVAULT_CONTRACT_ADDRESS);

            try {
                // Call addCourtOfficial function
                const tx = await eVaultContract.methods.addCourtOfficial(courtOfficialAddress).send({ from: accounts[0] });
                console.log("Transaction sent. Hash:", tx.transactionHash);
                console.log(`Account ${courtOfficialAddress} added as court official successfully!`);
            } catch (error) {
                console.error("Error adding court official:", error);
            }
        } else {
            console.log("Please install MetaMask!");
        }
    };

    return (
        <div>
            <h1>Lawyer Dashboard</h1>
            <button onClick={handleAddCourtOfficial}>Add Myself as Court Official</button>
        </div>
    );
};

export default LawyerDashboard;
