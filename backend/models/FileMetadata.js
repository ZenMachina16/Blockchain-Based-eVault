// models/FileMetadata.js
const mongoose = require("mongoose");

const fileMetadataSchema = new mongoose.Schema({
  originalname: { type: String, required: true, unique: true },
  title: { type: String },
  dateOfJudgment: { type: String },
  caseNumber: { type: String },
  category: { type: String },
  judgeName: { type: String },
  linkedClients: { type: [String] },
  ipfsHash: { type: String, required: true },
  uploader: { type: String },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("FileMetadata", fileMetadataSchema);
