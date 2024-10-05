import React, { useState } from 'react';
import axios from 'axios';

const LawyerDashboard = () => {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            setMessage('Please select a file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:5000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMessage(response.data.message); // Success message from server
        } catch (error) {
            console.error("Error uploading file:", error);
            setMessage('Error uploading file. Please try again.');
        }
    };

    return (
        <div>
            <h2>Lawyer Dashboard</h2>
            <p>Upload documents and manage your cases.</p>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload Document</button>
            {message && <p>{message}</p>}
        </div>
    );
};

export default LawyerDashboard;
