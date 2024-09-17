const express = require('express');
const cors = require('cors');
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
require('dotenv').config();

const { uploadToPinata } = require('../scripts/pinataIntegration'); // Import the function

const app = express(); // Initialize the app
const PORT = 5000;

// Use CORS middleware
app.use(cors());

// Endpoint to handle file upload
app.post('/upload', (req, res) => {
  const form = new formidable.IncomingForm();

  form.uploadDir = path.join(__dirname, 'temp'); // Temporary directory for uploads
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error processing file:', err);
      return res.status(500).json({ error: 'Error processing file' });
    }

    const file = files.file[0];
    const filePath = file.filepath;
    console.log('File received:', filePath);

    try {
      // Create a read stream from the file
      const fileStream = fs.createReadStream(filePath);

      // Upload the file to Pinata using the Pinata SDK function
      const ipfsHash = await uploadToPinata(fileStream, file.originalFilename);

      // Clean up temporary file
      fs.unlinkSync(filePath);

      res.json({ ipfsHash });
    } catch (error) {
      console.error('Error uploading file to Pinata:', error);
      res.status(500).json({ error: 'Failed to upload file to Pinata' });
    }
  });
});

// Endpoint to fetch document hash from the smart contract
const scriptPath = path.resolve(__dirname, '../scripts/getHashFromContract.js');
app.get('/document-hash', (req, res) => {
  exec(`npx hardhat run ${scriptPath} --network sepolia`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing script: ${error}`);
      return res.status(500).json({ error: 'Failed to fetch document hash' });
    }

    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return res.status(500).json({ error: 'Error in script execution' });
    }

    try {
      const result = JSON.parse(stdout);
      res.json(result);
    } catch (parseError) {
      console.error(`Error parsing script output: ${parseError}`);
      res.status(500).json({ error: 'Failed to parse document hash' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
