// server.js

const express = require('express'); // Import express for building the server
const multer = require('multer'); // Import multer for handling file uploads
const path = require('path'); // Import path for handling file paths
const fs = require('fs'); // Import fs for file system operations
const { uploadToPinata, storeHashInContract } = require('../scripts/pinataIntegration'); // Import functions for Pinata interaction
const { ethers } = require("hardhat"); // Import ethers for contract interaction
require("dotenv").config(); // Load environment variables

const app = express();
const upload = multer({ dest: 'uploads/' }); // Specify the directory for storing uploaded files

// In-memory storage for metadata (you can switch to a database for persistent storage)
let fileMetadata = {}; // Initialize an object to store file metadata

// Middleware to handle JSON parsing for linkedClients
app.use(express.json());

// Endpoint to handle file upload
app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    // Access metadata from req.body
    const { title, dateOfJudgment, caseNumber, category, judgeName, linkedClients } = req.body;

    console.log('Uploaded file:', req.file);
    console.log('Metadata:', { title, dateOfJudgment, caseNumber, category, judgeName, linkedClients });

    try {
        // Upload the file to Pinata
        const fileStream = fs.createReadStream(req.file.path); // Read the uploaded file
        const ipfsHash = await uploadToPinata(fileStream, req.file.originalname); // Upload to Pinata
        console.log("Uploaded to Pinata. IPFS Hash:", ipfsHash);
        
        // Ensure linkedClients is an array
        const clientsArray = Array.isArray(linkedClients) ? linkedClients : JSON.parse(linkedClients || "[]");

        // Store the IPFS hash in the smart contract
        await storeHashInContract(ipfsHash, title, dateOfJudgment, caseNumber, category, judgeName, clientsArray);

        // Store metadata in the in-memory object using the filename as the key
        fileMetadata[req.file.filename] = {
            title,
            dateOfJudgment,
            caseNumber,
            category,
            judgeName,
            linkedClients: clientsArray, // Store as an array
            uploader: req.file.originalname,
            timestamp: new Date(),
            ipfsHash // Store the IPFS hash for easy retrieval
        };

        res.json({
            message: 'File uploaded successfully',
            file: req.file,
            ipfsHash, // Include the IPFS hash in the response
            metadata: fileMetadata[req.file.filename] // Return stored metadata
        });
    } catch (error) {
        console.error("Error during upload and storage process:", error);
        res.status(500).json({ message: 'Error processing the upload', error: error.message });
    } finally {
        // Clean up the uploaded file
        fs.unlink(req.file.path, (err) => {
            if (err) console.error(`Error deleting file: ${err}`);
        });
    }
});

// Endpoint to retrieve all uploaded case files
app.get('/files', async (req, res) => {
    const [deployer] = await ethers.getSigners();
    console.log("Fetching case files with the account:", deployer.address);

    const NavinEvault = await ethers.getContractFactory("NavinEvault");
    const contract = await NavinEvault.attach(process.env.NAVINEVAULT_CONTRACT_ADDRESS);

    try {
        const totalFiles = await contract.totalCaseFiles();
        console.log(`Total case files: ${totalFiles.toString()}`);

        if (totalFiles.isZero()) {
            return res.status(404).json({ message: "No case files exist." });
        }

        const allCaseFiles = [];

        for (let i = 1; i <= totalFiles; i++) {
            const caseFile = await contract.getFile(i);
            const caseFileData = {
                caseNumber: caseFile.caseNumber.toString(),
                title: caseFile.title || "N/A",
                ipfsHash: caseFile.ipfsHash || null,
                dateOfJudgment: caseFile.dateOfJudgment || "N/A",
                category: caseFile.category || "N/A",
                judgeName: caseFile.judgeName || "N/A",
                linkedClients: caseFile.linkedClients || [],
                metadata: {
                    uploader: caseFile.uploader || "N/A",
                    timestamp: caseFile.timestamp.toString() || "N/A"
                }
            };

            allCaseFiles.push(caseFileData);
        }

        res.json({
            message: 'Case files retrieved successfully',
            files: allCaseFiles
        });
    } catch (error) {
        console.error("Error retrieving case files:", error);
        res.status(500).json({ message: 'Error fetching case files', error: error.message });
    }
});

// Endpoint to retrieve file metadata by filename
app.get('/metadata/:filename', (req, res) => {
    const filename = req.params.filename;

    // Retrieve metadata for the specified file
    const metadata = fileMetadata[filename];

    if (metadata) {
        res.json({
            message: 'Metadata retrieved successfully',
            metadata
        });
    } else {
        res.status(404).json({ message: 'Metadata not found for the specified file' });
    }
});

// Start the server
const PORT = process.env.PORT || 5000; // Use the specified PORT or default to 5000
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
