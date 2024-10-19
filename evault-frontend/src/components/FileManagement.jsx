import React, { useState } from 'react';
import axios from 'axios';

const FileManagement = () => {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [dateOfJudgment, setDateOfJudgment] = useState('');
    const [caseNumber, setCaseNumber] = useState('');
    const [category, setCategory] = useState('');
    const [judgeName, setJudgeName] = useState('');
    const [linkedClients, setLinkedClients] = useState([]);
    const [caseFiles, setCaseFiles] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [filenameToFetch, setFilenameToFetch] = useState(''); // State to hold filename input
    const [fetchedMetadata, setFetchedMetadata] = useState(null); // State to hold fetched metadata

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!file) {
            alert('Please select a file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('dateOfJudgment', dateOfJudgment);
        formData.append('caseNumber', caseNumber);
        formData.append('category', category);
        formData.append('judgeName', judgeName);
        formData.append('linkedClients', JSON.stringify(linkedClients));

        try {
            const response = await axios.post('http://localhost:5000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log(response.data);
            alert('File uploaded successfully!');
        } catch (error) {
            console.error('Error uploading file:', error);
            alert(`Error uploading file: ${error.response?.data?.message || error.message}`);
        }
    };

    const fetchCaseFiles = async () => {
        try {
            const response = await axios.get('http://localhost:5000/files');
            setCaseFiles(response.data.files);
            setErrorMessage('');
        } catch (error) {
            console.error('Error fetching case files:', error);
            setErrorMessage(`Error fetching files: ${error.response?.data?.message || error.message}`);
        }
    };

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

    const handleLinkedClientsChange = (e) => {
        const input = e.target.value;
        const clientsArray = input.split(',').map(client => client.trim());
        setLinkedClients(clientsArray);
    };

    return (
        <div>
            <form onSubmit={handleUpload}>
                <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
                <input type="text" placeholder="Title" onChange={(e) => setTitle(e.target.value)} required />
                <input type="text" placeholder="Date of Judgment" onChange={(e) => setDateOfJudgment(e.target.value)} required />
                <input type="text" placeholder="Case Number" onChange={(e) => setCaseNumber(e.target.value)} required />
                <input type="text" placeholder="Category" onChange={(e) => setCategory(e.target.value)} required />
                <input type="text" placeholder="Judge Name" onChange={(e) => setJudgeName(e.target.value)} required />
                <input type="text" placeholder="Linked Clients (comma-separated)" onChange={handleLinkedClientsChange} required />
                <button type="submit">Upload</button>
            </form>

            <button onClick={fetchCaseFiles}>Fetch Case Files</button>

            <div>
                <h2>Fetch Metadata by Filename:</h2>
                <input
                    type="text"
                    placeholder="Enter filename"
                    value={filenameToFetch}
                    onChange={(e) => setFilenameToFetch(e.target.value)}
                />
                <button onClick={fetchFileMetadata}>Fetch Metadata</button>
            </div>

            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

            {caseFiles.length > 0 && (
                <div>
                    <h2>Fetched Case Files:</h2>
                    <ul>
                        {caseFiles.map((file, index) => (
                            <li key={index}>
                                <strong>Case Number:</strong> {file.caseNumber} <br />
                                <strong>Title:</strong> {file.title} <br />
                                <strong>IPFS Hash:</strong> {file.ipfsHash} <br />
                                <strong>Date of Judgment:</strong> {file.dateOfJudgment} <br />
                                <strong>Category:</strong> {file.category} <br />
                                <strong>Judge Name:</strong> {file.judgeName} <br />
                                <strong>Linked Clients:</strong> {file.linkedClients.join(', ')} <br />
                                <strong>Uploader:</strong> {file.metadata.uploader} <br />
                                <strong>Timestamp:</strong> {file.metadata.timestamp} <br />
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {fetchedMetadata && (
                <div>
                    <h2>Fetched Metadata:</h2>
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

export default FileManagement;
