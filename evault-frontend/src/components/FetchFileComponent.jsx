import React, { useState } from 'react';
import axios from 'axios';

const FetchFileComponent = () => {
    const [filenameToFetch, setFilenameToFetch] = useState('');
    const [fetchedMetadata, setFetchedMetadata] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    const fetchFileMetadata = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/metadata/${filenameToFetch}`);
            setFetchedMetadata(response.data.metadata);
            setErrorMessage('');
        } catch (error) {
            console.error('Error fetching file metadata:', error);
            setErrorMessage(`Error fetching metadata: ${error.response?.data?.message || error.message}`);
            setFetchedMetadata(null); // Clear previously fetched metadata on error
        }
    };

    return (
        <div>
            <h2>Fetch Metadata by Filename:</h2>
            <input
                type="text"
                placeholder="Enter filename"
                value={filenameToFetch}
                onChange={(e) => setFilenameToFetch(e.target.value)}
            />
            <button onClick={fetchFileMetadata}>Fetch Metadata</button>

            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

            {fetchedMetadata && (
                <div>
                    <h3>Fetched Metadata:</h3>
                    <strong>Title:</strong> {fetchedMetadata.title} <br />
                    <strong>IPFS Hash:</strong> {fetchedMetadata.ipfsHash} <br />
                    <strong>Date of Judgment:</strong> {fetchedMetadata.dateOfJudgment} <br />
                    <strong>Case Number:</strong> {fetchedMetadata.caseNumber} <br />
                    <strong>Category:</strong> {fetchedMetadata.category} <br />
                    <strong>Judge Name:</strong> {fetchedMetadata.judgeName} <br />
                    <strong>Linked Clients:</strong> {fetchedMetadata.linkedClients.join(', ')} <br />
                    <strong>Uploader:</strong> {fetchedMetadata.uploader} <br />
                    <strong>Timestamp:</strong> {new Date(fetchedMetadata.timestamp).toLocaleString()} <br />
                </div>
            )}
        </div>
    );
};

export default FetchFileComponent;
