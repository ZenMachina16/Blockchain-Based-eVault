import React, { useState } from 'react';
import axios from 'axios';

const RetrieveComponent = () => {
  const [ipfsUrl, setIpfsUrl] = useState('');
  const [message, setMessage] = useState('');

  const fetchDocumentHash = async () => {
    try {
      // Adjust URL if necessary
      const response = await axios.get('http://localhost:5000/document-hash');
      
      // Check if the response contains a valid document hash
      if (response.data && response.data.documentHash) {
        setIpfsUrl(`https://gateway.pinata.cloud/ipfs/${response.data.documentHash}`);
        setMessage('Document hash fetched successfully');
      } else {
        setMessage('No document hash found for this address.');
      }
    } catch (error) {
      console.error('Error fetching hash from backend:', error);
      setMessage('Failed to fetch document hash');
    }
  };

  return (
    <div>
      <h2>Retrieve Document Hash</h2>
      <button onClick={fetchDocumentHash}>Fetch Hash</button>
      {ipfsUrl && (
        <div>
          <h3>Document:</h3>
          <a href={ipfsUrl} target="_blank" rel="noopener noreferrer">View Document</a>
        </div>
      )}
      <p>{message}</p>
    </div>
  );
};

export default RetrieveComponent;
