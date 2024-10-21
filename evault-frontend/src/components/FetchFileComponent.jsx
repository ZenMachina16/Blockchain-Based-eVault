import React, { useState } from 'react';
import axios from 'axios';
import './CSS/FetchFileComponent.css'; // Import the CSS file

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
        <>
            <div className="background-image"></div> {/* Background image */}
            <div className="overlay"> {/* Dark overlay */}
            <h2 className="main-heading">SEARCH A CASE FILE</h2> {/* Main heading */}
            <div className="fetch-container">
                <div className="fetch-input-button">
                    <input
                        type="text"
                        placeholder="Enter filename"
                        value={filenameToFetch}
                        onChange={(e) => setFilenameToFetch(e.target.value)}
                    />
                    <button onClick={fetchFileMetadata}>Fetch Metadata</button>
                </div>

                {errorMessage && <p>{errorMessage}</p>}

                {fetchedMetadata && (
                    <div className="metadata-container">
                        <h3>Case File Data</h3>
                        <strong>Title:</strong> {fetchedMetadata.title} <br />
                        <strong>IPFS Hash:</strong>{' '}
                        <a
                            href={`https://ipfs.io/ipfs/${fetchedMetadata.ipfsHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {fetchedMetadata.ipfsHash}
                        </a>
                        <br />
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
            </div>
        </>
    );
};

export default FetchFileComponent;
