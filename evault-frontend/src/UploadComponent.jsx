import React, { useState } from 'react';
import { uploadToPinata } from '../path/to/pinataIntegration'; // Adjust the import based on your file structure
import { ethers } from 'ethers';
import NavinEvault from '../contractABI'; // Import your contract ABI

const UploadComponent = () => {
    const [file, setFile] = useState(null);
    const [ipfsHash, setIpfsHash] = useState('');
    const [title, setTitle] = useState('');
    const [dateOfJudgment, setDateOfJudgment] = useState('');
    const [caseNumber, setCaseNumber] = useState('');
    const [category, setCategory] = useState('');
    const [judgeName, setJudgeName] = useState('');
    const [linkedClients, setLinkedClients] = useState([]); // Array of client addresses

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            alert('Please select a file to upload');
            return;
        }

        try {
            const fileStream = fs.createReadStream(file.path); // If using a Node.js backend
            const hash = await uploadToPinata(fileStream, file.name);
            setIpfsHash(hash);

            // Now store the hash in the blockchain
            await storeHashInBlockchain(hash);
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    const storeHashInBlockchain = async (hash) => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract('0xYourContractAddress', NavinEvault, signer); // Replace with your contract address

            const transaction = await contract.uploadFile(
                hash,
                title,
                dateOfJudgment,
                caseNumber,
                category,
                judgeName,
                linkedClients
            );

            await transaction.wait();
            alert('File uploaded and hash stored in blockchain!');
        } catch (error) {
            console.error('Error interacting with smart contract:', error);
            alert('Failed to store hash in blockchain.');
        }
    };

    return (
        <div>
            <h1>Upload Document</h1>
            <input type="file" onChange={handleFileChange} />
            <input type="text" placeholder="Title" onChange={(e) => setTitle(e.target.value)} />
            <input type="text" placeholder="Date of Judgment" onChange={(e) => setDateOfJudgment(e.target.value)} />
            <input type="text" placeholder="Case Number" onChange={(e) => setCaseNumber(e.target.value)} />
            <input type="text" placeholder="Category" onChange={(e) => setCategory(e.target.value)} />
            <input type="text" placeholder="Judge Name" onChange={(e) => setJudgeName(e.target.value)} />
            <input type="text" placeholder="Linked Clients (comma-separated)" onChange={(e) => setLinkedClients(e.target.value.split(','))} />
            <button onClick={handleUpload}>Upload</button>
        </div>
    );
};

export default UploadComponent;
