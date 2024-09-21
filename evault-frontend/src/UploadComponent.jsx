import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Web3 from 'web3';
import { DocumentStorageABI } from './contractABI';

const UploadComponent = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [ipfsUrl, setIpfsUrl] = useState('');
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [isCourtOfficial, setIsCourtOfficial] = useState(false);
  const [ownerAddress, setOwnerAddress] = useState('');
  const [fileId, setFileId] = useState('');
  const [documentDetails, setDocumentDetails] = useState(null);
  const [searchTitle, setSearchTitle] = useState('');
  const [foundFileIds, setFoundFileIds] = useState([]);

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        await logAccounts(web3Instance);
      } else {
        setMessage('MetaMask is not installed.');
        console.error('MetaMask is not installed');
      }
    };

    initWeb3();
  }, []);

  const logAccounts = async (web3Instance) => {
    try {
      const accounts = await web3Instance.eth.requestAccounts();
      setAccounts(accounts);
      const contract = new web3Instance.eth.Contract(DocumentStorageABI, process.env.REACT_APP_NEWEVAULT_CONTRACT_ADDRESS);
      const owner = await contract.methods.owner().call();
      setOwnerAddress(owner);
      await checkIfCourtOfficial(web3Instance, accounts[0]);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setMessage('Error fetching accounts.');
    }
  };

  const checkIfCourtOfficial = async (web3Instance, account) => {
    try {
      const contract = new web3Instance.eth.Contract(DocumentStorageABI, process.env.REACT_APP_NEWEVAULT_CONTRACT_ADDRESS);
      const isOfficial = await contract.methods.isCourtOfficial(account).call();
      setIsCourtOfficial(isOfficial);
      setMessage(`Court official status: ${isOfficial}`);
    } catch (error) {
      console.error('Error checking court official status:', error);
      setMessage('Failed to check court official status.');
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('File selected: ' + e.target.files[0].name);
  };

  const handleFileUpload = async () => {
    if (!file) {
      setMessage('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setMessage('Uploading file...');
      const res = await axios.post('http://localhost:5000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const ipfsHash = res.data.ipfsHash;
      setIpfsUrl(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
      setMessage(`File uploaded to IPFS successfully! IPFS Hash: ${ipfsHash}`);

      const newFileId = await storeHashInBlockchain(ipfsHash);
      setFileId(newFileId);
    } catch (error) {
      console.error('Error uploading file to backend:', error);
      setMessage('Failed to upload file to backend.');
    }
  };

  const storeHashInBlockchain = async (ipfsHash) => {
    try {
      if (!web3) throw new Error('Web3 is not initialized');

      setMessage('Storing IPFS hash in blockchain...');
      const contract = new web3.eth.Contract(DocumentStorageABI, process.env.REACT_APP_NEWEVAULT_CONTRACT_ADDRESS);
      const transaction = await contract.methods.uploadFile(
        ipfsHash,
        "Successful Case",
        "2024-09-21",
        "C-12346",
        "Civil",
        "Judge John Dugh"
      ).send({ from: accounts[0] });

      const fileId = transaction.events.FileUploaded.returnValues.fileId;
      setMessage(`File stored on blockchain successfully! Transaction Hash: ${transaction.transactionHash}`);
      return fileId;
    } catch (error) {
      console.error('Error interacting with smart contract:', error);
      setMessage('Failed to store hash in blockchain.');
    }
  };

  const fetchDocumentDetails = async () => {
    if (!fileId) {
      setMessage('Please enter a valid file ID.');
      return;
    }

    try {
      const contract = new web3.eth.Contract(DocumentStorageABI, process.env.REACT_APP_NEWEVAULT_CONTRACT_ADDRESS);
      const document = await contract.methods.caseFiles(fileId).call();

      if (!document.ipfsHash) {
        setMessage('No document found with the given file ID.');
        return;
      }

      const documentData = {
        uploader: document.uploader,
        ipfsHash: document.ipfsHash,
        title: document.title,
        dateOfJudgment: document.dateOfJudgment,
        caseNumber: document.caseNumber,
        category: document.category,
        judgeName: document.judgeName,
        timestamp: new Date(document.timestamp * 1000).toLocaleString(),
      };

      setDocumentDetails(documentData);
      setMessage('Document details retrieved successfully.');
    } catch (error) {
      console.error('Error fetching document details:', error);
      setMessage('Failed to retrieve document details.');
    }
  };

  return (
    <div>
      <h2>Upload Document</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleFileUpload}>Upload</button>
      <p>{message}</p>

      <h2>Retrieve Document</h2>
      <input type="text" placeholder="Enter File ID" value={fileId} onChange={(e) => setFileId(e.target.value)} />
      <button onClick={fetchDocumentDetails}>Fetch Document</button>

      {documentDetails && (
        <div>
          <h3>Document Details:</h3>
          <p><strong>Title:</strong> {documentDetails.title}</p>
          <p><strong>Date of Judgment:</strong> {documentDetails.dateOfJudgment}</p>
          <p><strong>Case Number:</strong> {documentDetails.caseNumber}</p>
          <p><strong>Category:</strong> {documentDetails.category}</p>
          <p><strong>Judge Name:</strong> {documentDetails.judgeName}</p>
          <p><strong>Uploader Address:</strong> {documentDetails.uploader}</p>
          <p><strong>Upload Timestamp:</strong> {documentDetails.timestamp}</p>
          <p><strong>IPFS Hash:</strong> <a href={`https://gateway.pinata.cloud/ipfs/${documentDetails.ipfsHash}`} target="_blank" rel="noopener noreferrer">View Document</a></p>
        </div>
      )}
    </div>
  );
};

export default UploadComponent;
