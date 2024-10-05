// Import necessary modules
const express = require('express');
const cors = require('cors'); // Import cors
const multer = require('multer');

// Import the uploadFile function from scripts/uploadFile.js
const { uploadFile } = require('./scripts/uploadFile'); // <-- Add this line

const app = express();
const port = 5000;

// Use CORS middleware
app.use(cors());

// Set up multer for file handling
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) return res.status(400).send("No file uploaded.");

        const metadata = {
            title: "Sample Case File", // Replace with dynamic values if necessary
            dateOfJudgment: "2023-09-30",
            caseNumber: "123ABC",
            category: "Civil",
            judgeName: "Judge Judy",
            linkedClients: ["0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"],
        };

        // Call the uploadFile function
        await uploadFile(file.buffer, file.originalname, metadata);
        
        // Respond with a success message
        res.json({ message: "File uploaded successfully." });
    } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).send("Internal server error");
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
