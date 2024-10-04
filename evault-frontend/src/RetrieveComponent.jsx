import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { NavinEvaultABI } from './contractABI';

const RetrieveComponent = () => {
  const [fileId, setFileId] = useState('');
  const [documentDetails, setDocumentDetails] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWeb3(web3Instance);
        setContract(new web3Instance.eth.Contract(NavinEvaultABI, process.env.REACT_APP_NAVINEVAULT_CONTRACT_ADDRESS));
      } else {
        console.error('MetaMask is not installed');
        setMessage('Please install MetaMask');
      }
    };

    initWeb3();
  }, []);

  const fetchDocumentDetails = async () => {
    if (!fileId) {
      setMessage('Please enter a valid file ID.');
      return;
    }

    setLoading(true);
    try {
      if (!contract) {
        setMessage('Contract is not initialized. Please refresh and try again.');
        return;
      }

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
        clientAddress: document.clientAddress, // Added client address
        timestamp: new Date(document.timestamp * 1000).toLocaleString(),
      };

      setDocumentDetails(documentData);
      setMessage('Document details retrieved successfully.');
    } catch (error) {
      console.error('Error fetching document details:', error);
      setMessage('Failed to retrieve document details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Retrieve Document by File ID</h2>
      <input type="text" placeholder="Enter File ID" value={fileId} onChange={(e) => setFileId(e.target.value)} />
      <button onClick={fetchDocumentDetails} disabled={loading}>Fetch Document</button>
      {loading && <p>Loading...</p>}
      <p>{message}</p>

      {documentDetails && (
        <div>
          <h3>Document Details:</h3>
          <p><strong>Title:</strong> {documentDetails.title}</p>
          <p><strong>Date of Judgment:</strong> {documentDetails.dateOfJudgment}</p>
          <p><strong>Case Number:</strong> {documentDetails.caseNumber}</p>
          <p><strong>Category:</strong> {documentDetails.category}</p>
          <p><strong>Judge Name:</strong> {documentDetails.judgeName}</p>
          <p><strong>Client Address:</strong> {documentDetails.clientAddress}</p> {/* Display client address */}
          <p><strong>Uploader Address:</strong> {documentDetails.uploader}</p>
          <p><strong>Upload Timestamp:</strong> {documentDetails.timestamp}</p>
          <p><strong>IPFS Hash:</strong> <a href={`https://gateway.pinata.cloud/ipfs/${documentDetails.ipfsHash}`} target="_blank" rel="noopener noreferrer">View Document</a></p>
        </div>
      )}
    </div>
  );
};

export default RetrieveComponent;
