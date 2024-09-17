import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Web3 from 'web3'; // Import web3
import { DocumentStorageABI } from './contractABI'; // Import your ABI

const UploadComponent = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [ipfsUrl, setIpfsUrl] = useState('');
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);

  const logAccounts = async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccounts(accounts);
      console.log('Accounts:', accounts);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      setWeb3(new Web3(window.ethereum));
      logAccounts();
    } else {
      console.error('MetaMask is not installed');
    }
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    console.log('File selected:', e.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!file) {
      setMessage('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('Uploading file to backend...');
      const res = await axios.post(
        'http://localhost:5000/upload', // Adjust to your backend URL
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const ipfsHash = res.data.ipfsHash; // Assuming the backend returns IPFS hash
      setIpfsUrl(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
      setMessage(`File uploaded to IPFS: ${ipfsHash}`);
      console.log('IPFS Hash:', ipfsHash);

      await storeHashInBlockchain(ipfsHash);
    } catch (error) {
      console.error('Error uploading file to backend:', error);
      setMessage('Failed to upload file to backend');
    }
  };

  const storeHashInBlockchain = async (ipfsHash) => {
    try {
      console.log('Storing IPFS hash in blockchain:', ipfsHash);
      if (!web3) {
        throw new Error('Web3 is not initialized');
      }
      
      const contract = new web3.eth.Contract(DocumentStorageABI, process.env.REACT_APP_CONTRACT_ADDRESS);

      if (accounts.length === 0) {
        await logAccounts(); // Ensure accounts are available
      }
      
      // Send the transaction and get the transaction receipt
      const transaction = await contract.methods.uploadDocument(ipfsHash).send({ from: accounts[0] });

      // Log the transaction hash
      console.log('Transaction Hash:', transaction.transactionHash);

      setMessage('IPFS hash stored in blockchain successfully! Transaction Hash: ' + transaction.transactionHash);
    } catch (error) {
      console.error('Error interacting with smart contract:', error);
      setMessage('Failed to store hash in blockchain');
    }
  };

  return (
    <div>
      <h2>Upload Document</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleFileUpload}>Upload</button>
      <p>{message}</p>
      {ipfsUrl && (
        <div>
          <h3>Uploaded Document:</h3>
          <a href={ipfsUrl} target="_blank" rel="noopener noreferrer">View Document</a>
        </div>
      )}
    </div>
  );
};

export default UploadComponent;
