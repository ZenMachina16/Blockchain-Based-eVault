  // backend/server.js

  const express = require('express');
  const multer = require('multer'); // Middleware for handling multipart/form-data
  const fs = require('fs'); // Import file system module
  const { uploadToPinata } = require('../scripts/pinataIntegration'); // Your existing upload function
  const bodyParser = require('body-parser');
  const cors = require('cors');

  const app = express();
  const port = process.env.PORT || 5000;

  app.use(cors()); // Enable CORS for all routes

  const upload = multer({ dest: 'uploads/' }); // Set destination for temporary file storage

  app.use(bodyParser.json());

  // Upload file to Pinata
  app.post('/upload', upload.single('file'), async (req, res) => {
    try {
      const fileStream = fs.createReadStream(req.file.path); // Read the uploaded file
      const ipfsHash = await uploadToPinata(fileStream, req.file.originalname);
      res.json({ success: true, ipfsHash });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
