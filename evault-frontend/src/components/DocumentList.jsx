// src/components/DocumentList.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        // Assuming you have multiple file IDs, you might want to fetch them in a loop or from a state
        const fileIds = [1, 2, 3]; // Example file IDs, replace with your logic

        const documentPromises = fileIds.map(id => axios.get(`http://localhost:5000/document-hash/${id}`));
        const documentResponses = await Promise.all(documentPromises);
        setDocuments(documentResponses.map(response => response.data));
      } catch (err) {
        console.error("Error fetching documents:", err);
        setError("Could not fetch documents.");
      }
    };

    fetchDocuments();
  }, []);

  return (
    <div>
      <h1>Uploaded Documents</h1>
      {error && <p>{error}</p>}
      {documents.length === 0 ? (
        <p>No documents uploaded yet.</p>
      ) : (
        <ul>
          {documents.map((doc, index) => (
            <li key={index}>
              <h3>{doc.title}</h3>
              <p>IPFS Hash: {doc.ipfsHash}</p>
              <p>Uploaded by: {doc.uploader}</p>
              <p>Date of Judgment: {doc.dateOfJudgment}</p>
              <p>Case Number: {doc.caseNumber}</p>
              <p>Category: {doc.category}</p>
              <p>Judge Name: {doc.judgeName}</p>
              <p>Linked Clients: {doc.linkedClients.join(', ')}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DocumentList;
