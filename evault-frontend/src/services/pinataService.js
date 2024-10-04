// src/services/pinataService.js

import axios from 'axios';

// Use your backend API URL here
const API_URL = 'http://localhost:5000/upload'; 

export const uploadFileToPinata = async (file) => {
    const formData = new FormData();
    formData.append('file', file); // Ensure the field name matches what the backend expects

    try {
        const response = await axios.post(API_URL, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.ipfsHash; // Return the IPFS hash from the response
    } catch (error) {
        console.error("Error uploading file to Pinata:", error);
        throw error; // Throw error to be handled in the component
    }
};
