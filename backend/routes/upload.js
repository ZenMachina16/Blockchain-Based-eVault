const express = require("express");
const multer = require("multer");
const fs = require("fs");
const {
  uploadToPinata,
  storeHashInContract,
} = require("../../scripts/pinataIntegration");
const { ethers } = require("hardhat");
const { authenticateToken } = require("../middleware/auth");
const fileMetadata = require("../data/fileMetadata");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// POST /upload - handle file upload (requires JWT authentication)
router.post("/", authenticateToken, upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // Extract metadata from the request body
  const {
    title,
    dateOfJudgment,
    caseNumber,
    category,
    judgeName,
    linkedClients,
  } = req.body;
  console.log("Uploaded file:", req.file);
  console.log("Metadata:", {
    title,
    dateOfJudgment,
    caseNumber,
    category,
    judgeName,
    linkedClients,
  });

  try {
    // Upload file to Pinata
    const fileStream = fs.createReadStream(req.file.path);
    const ipfsHash = await uploadToPinata(fileStream, req.file.originalname);
    console.log("Uploaded to Pinata. IPFS Hash:", ipfsHash);

    // Ensure linkedClients is an array (parse if needed)
    const clientsArray = Array.isArray(linkedClients)
      ? linkedClients
      : JSON.parse(linkedClients || "[]");

    // Store the IPFS hash in the smart contract
    await storeHashInContract(
      ipfsHash,
      title,
      dateOfJudgment,
      caseNumber,
      category,
      judgeName,
      clientsArray,
    );

    // Save metadata in the shared in-memory store using the filename as the key
    fileMetadata[req.file.filename] = {
      title,
      dateOfJudgment,
      caseNumber,
      category,
      judgeName,
      linkedClients: clientsArray,
      uploader: req.file.originalname,
      timestamp: new Date(),
      ipfsHash,
    };

    res.json({
      message: "File uploaded successfully",
      file: req.file,
      ipfsHash,
      metadata: fileMetadata[req.file.filename],
    });
  } catch (error) {
    console.error("Error during upload and storage process:", error);
    res
      .status(500)
      .json({ message: "Error processing the upload", error: error.message });
  } finally {
    // Clean up the file from local storage
    fs.unlink(req.file.path, (err) => {
      if (err) console.error(`Error deleting file: ${err}`);
    });
  }
});

module.exports = router;
