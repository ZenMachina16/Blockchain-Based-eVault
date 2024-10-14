import React, { useState } from 'react';
import axios from 'axios'; // Ensure axios is installed
import { getContractInstance, getCurrentAccount } from '../web3'; // Import the functions

const UploadDocCourtOfficial = () => {
  const [file, setFile] = useState(null);
  const [ipfsHash, setIpfsHash] = useState('');
  const [title, setTitle] = useState('');
  const [dateOfJudgment, setDateOfJudgment] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [category, setCategory] = useState('');
  const [judgeName, setJudgeName] = useState('');
  const [linkedClients, setLinkedClients] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file); // Append the file to the form data

    try {
      // Call the backend to upload the file to Pinata
      const response = await axios.post('http://localhost:5000/upload', formData);
      const hash = response.data.ipfsHash;
      setIpfsHash(hash);

      // Get the contract instance and the user's account
      const contract = getContractInstance();
      const account = await getCurrentAccount();

      // Call the smart contract to upload the document with the IPFS hash
      await contract.methods.uploadFile(
        hash,
        title,
        dateOfJudgment,
        caseNumber,
        category,
        judgeName,
        linkedClients
      ).send({ from: account }); // Use the current account

      console.log('File uploaded to blockchain with IPFS hash:', hash);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div>
      <h1>Upload Document as Court Official</h1>
      <input type="file" onChange={handleFileChange} />
      <input type="text" placeholder="Title" onChange={(e) => setTitle(e.target.value)} />
      <input type="text" placeholder="Date of Judgment" onChange={(e) => setDateOfJudgment(e.target.value)} />
      <input type="text" placeholder="Case Number" onChange={(e) => setCaseNumber(e.target.value)} />
      <input type="text" placeholder="Category" onChange={(e) => setCategory(e.target.value)} />
      <input type="text" placeholder="Judge Name" onChange={(e) => setJudgeName(e.target.value)} />
      <input type="text" placeholder="Linked Clients (comma-separated)" onChange={(e) => setLinkedClients(e.target.value.split(','))} />
      <button onClick={handleUpload}>Upload Document</button>
      {ipfsHash && <p>File uploaded to IPFS with hash: {ipfsHash}</p>}
    </div>
  );
};

export default UploadDocCourtOfficial;
