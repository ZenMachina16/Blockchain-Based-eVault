import React, { useState } from 'react';
import axios from 'axios';

const DocumentUpload = () => {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [dateOfJudgment, setDateOfJudgment] = useState('');
    const [caseNumber, setCaseNumber] = useState('');
    const [category, setCategory] = useState('');
    const [judgeName, setJudgeName] = useState('');
    const [linkedClients, setLinkedClients] = useState('');
    const [uploadMessage, setUploadMessage] = useState(''); // State for upload success/error message
    const [isLoading, setIsLoading] = useState(false); // State for loading spinner

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Ensure a file is selected
        if (!file) {
            setUploadMessage('Please select a file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('dateOfJudgment', dateOfJudgment);
        formData.append('caseNumber', caseNumber);
        formData.append('category', category);
        formData.append('judgeName', judgeName);
        formData.append('linkedClients', JSON.stringify(linkedClients.split(','))); // Split comma-separated values

        setIsLoading(true); // Set loading state to true

        try {
            const response = await axios.post('http://localhost:5000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('File uploaded successfully:', response.data);
            setUploadMessage(`File uploaded! IPFS Hash: ${response.data.ipfsHash}, Transaction Hash: ${response.data.txHash}`); // Show both IPFS and blockchain transaction hashes
        } catch (error) {
            console.error('Error uploading file:', error);
            setUploadMessage('Error uploading file. Please try again.'); // Set error message
        } finally {
            setIsLoading(false); // Reset loading state
        }
    };

    return (
        <div>
            <h2>Upload Document</h2>
            <form onSubmit={handleSubmit}>
                <input type="file" onChange={handleFileChange} required />
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
                <input type="date" value={dateOfJudgment} onChange={(e) => setDateOfJudgment(e.target.value)} required />
                <input type="text" value={caseNumber} onChange={(e) => setCaseNumber(e.target.value)} placeholder="Case Number" required />
                <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" required />
                <input type="text" value={judgeName} onChange={(e) => setJudgeName(e.target.value)} placeholder="Judge Name" required />
                <input type="text" value={linkedClients} onChange={(e) => setLinkedClients(e.target.value)} placeholder="Linked Clients (comma-separated)" required />
                <button type="submit" disabled={isLoading}>Upload Document</button>
            </form>
            {isLoading && <p>Uploading...</p>} {/* Loading message */}
            {uploadMessage && <p>{uploadMessage}</p>} {/* Success/Error message */}
        </div>
    );
};

export default DocumentUpload;
