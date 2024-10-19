// src/components/SendDataButton.jsx

import React from 'react';

const SendDataButton = () => {
    const handleSendData = async () => {
        // Hardcoded data to send
        const data = {
            title: "Sample Case Title",
            dateOfJudgment: "2024-10-01",
            caseNumber: "12345",
            category: "Civil",
            judgeName: "Judge Doe",
            linkedClients: JSON.stringify(["client1", "client2"]) // Hardcoded clients as a JSON string
        };

        // Prepare the file (simulating an uploaded file)
        const file = new Blob(["Sample file content"], { type: 'text/plain' });
        const formData = new FormData();
        formData.append('file', file, 'sample.txt'); // Add a dummy file

        // Append the hardcoded data
        Object.keys(data).forEach(key => {
            formData.append(key, data[key]);
        });

        try {
            const response = await fetch('http://localhost:5000/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            console.log(result);
        } catch (error) {
            console.error("Error sending data:", error);
        }
    };

    return (
        <div>
            <button onClick={handleSendData}>Send Data to Backend</button>
        </div>
    );
};

export default SendDataButton;
