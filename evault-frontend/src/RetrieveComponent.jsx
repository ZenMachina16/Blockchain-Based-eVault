import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { DocumentStorageABI } from './contractABI';

const RetrieveComponent = () => {
  const [title, setTitle] = useState('');
  const [documentDetails, setDocumentDetails] = useState([]);
  const [allFiles, setAllFiles] = useState([]);
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
        setContract(new web3Instance.eth.Contract(DocumentStorageABI, process.env.REACT_APP_NEWEVAULT_CONTRACT_ADDRESS));
      } else {
        console.error('MetaMask is not installed');
        setMessage('Please install MetaMask');
      }
    };

    initWeb3();
  }, []);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const fetchDocumentsByTitle = async () => {
    if (!title) {
      setMessage('Please enter a valid title.');
      return;
    }

    setLoading(true);
    try {
      if (!contract) {
        setMessage('Contract is not initialized. Please refresh and try again.');
        return;
      }

      const fileIds = await contract.methods.searchByTitle(title).call();

      if (fileIds.length === 0) {
        setMessage('No documents found with this title.');
        setDocumentDetails([]);
        return;
      }

      const documents = await Promise.all(
        fileIds.map(fileId => contract.methods.caseFiles(fileId).call())
      );

      const documentData = documents.map(doc => ({
        uploader: doc.uploader,
        ipfsHash: doc.ipfsHash,
        title: doc.title,
        dateOfJudgment: doc.dateOfJudgment,
        caseNumber: doc.caseNumber,
        category: doc.category,
        judgeName: doc.judgeName,
        timestamp: new Date(Number(doc.timestamp) * 1000).toLocaleString(),
      }));

      setDocumentDetails(documentData);
      setMessage('Document details retrieved successfully.');
    } catch (error) {
      console.error('Error fetching document details from blockchain:', error);
      setMessage(`Failed to retrieve document details: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllDocuments = async () => {
    setLoading(true);
    try {
      if (!contract) {
        setMessage('Contract is not initialized. Please refresh and try again.');
        return;
      }

      const totalFiles = await contract.methods.totalCaseFiles().call();
      const documents = await Promise.all(
        Array.from({ length: Number(totalFiles) }, async (_, index) => {
          const fileId = index + 1; // IDs start from 1
          return await contract.methods.caseFiles(fileId).call();
        })
      );

      const documentData = documents.map(doc => ({
        uploader: doc.uploader,
        ipfsHash: doc.ipfsHash,
        title: doc.title,
        dateOfJudgment: doc.dateOfJudgment,
        caseNumber: doc.caseNumber,
        category: doc.category,
        judgeName: doc.judgeName,
        timestamp: new Date(Number(doc.timestamp) * 1000).toLocaleString(),
      }));

      setAllFiles(documentData);
      setMessage('All document details retrieved successfully.');
    } catch (error) {
      console.error('Error fetching all documents:', error);
      setMessage(`Failed to retrieve document details: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Retrieve Document by Title</h2>
      <input type="text" placeholder="Enter Document Title" value={title} onChange={handleTitleChange} />
      <button onClick={fetchDocumentsByTitle} disabled={loading}>Search</button>
      <button onClick={fetchAllDocuments} disabled={loading}>View All Uploaded Files</button>
      {loading && <p>Loading...</p>}
      <p>{message}</p>

      {documentDetails.length > 0 && (
        <div>
          <h3>Document Details:</h3>
          {documentDetails.map((doc, index) => (
            <div key={index}>
              <p><strong>Title:</strong> {doc.title}</p>
              <p><strong>Date of Judgment:</strong> {doc.dateOfJudgment}</p>
              <p><strong>Case Number:</strong> {doc.caseNumber}</p>
              <p><strong>Category:</strong> {doc.category}</p>
              <p><strong>Judge Name:</strong> {doc.judgeName}</p>
              <p><strong>Uploader Address:</strong> {doc.uploader}</p>
              <p><strong>Upload Timestamp:</strong> {doc.timestamp}</p>
              <p><strong>IPFS Hash:</strong> <a href={`https://gateway.pinata.cloud/ipfs/${doc.ipfsHash}`} target="_blank" rel="noopener noreferrer">View Document</a></p>
            </div>
          ))}
        </div>
      )}

      {allFiles.length > 0 && (
        <div>
          <h3>All Uploaded Files:</h3>
          {allFiles.map((doc, index) => (
            <div key={index}>
              <p><strong>Title:</strong> {doc.title}</p>
              <p><strong>Date of Judgment:</strong> {doc.dateOfJudgment}</p>
              <p><strong>Case Number:</strong> {doc.caseNumber}</p>
              <p><strong>Category:</strong> {doc.category}</p>
              <p><strong>Judge Name:</strong> {doc.judgeName}</p>
              <p><strong>Uploader Address:</strong> {doc.uploader}</p>
              <p><strong>Upload Timestamp:</strong> {doc.timestamp}</p>
              <p><strong>IPFS Hash:</strong> <a href={`https://gateway.pinata.cloud/ipfs/${doc.ipfsHash}`} target="_blank" rel="noopener noreferrer">View Document</a></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RetrieveComponent;
