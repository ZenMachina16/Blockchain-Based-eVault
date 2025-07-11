import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Paper,
  Tooltip,
  Link
} from '@mui/material';
import { Delete as DeleteIcon, Download as DownloadIcon, Upload as UploadIcon, Verified as VerifiedIcon } from '@mui/icons-material';
import axios from 'axios';
import { ethers } from 'ethers';
import contractABI from '../contractABI';
import { useNavigate } from 'react-router-dom';

const CaseDocuments = ({ caseId, userRole }) => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openUpload, setOpenUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentDescription, setDocumentDescription] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [isApprovedLawyer, setIsApprovedLawyer] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);

  // Use the correct contract address from environment variables
  const contractAddress = process.env.REACT_APP_NAVINEVAULT_CONTRACT_ADDRESS || "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

  useEffect(() => {
    // Check if the user is a properly approved lawyer
    const checkLawyerStatus = async () => {
      try {
        if (!window.ethereum) return;
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        
        // Get the current user address
        const userAddress = await signer.getAddress();
        console.log("Current user address:", userAddress);
        
        // Check if already a lawyer
        const isLawyer = await contract.isLawyer(userAddress);
        console.log("User is approved lawyer:", isLawyer);
        
        setIsApprovedLawyer(isLawyer);
        if (userRole === 'lawyer' && !isLawyer) {
          setNeedsApproval(true);
        }
      } catch (error) {
        console.error("Error checking lawyer status:", error);
      }
    };
    
    checkLawyerStatus();
    fetchDocuments();
  }, [caseId, contractAddress, userRole]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if window.ethereum is available
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed or not accessible");
      }

      // Connect to blockchain using ethers.js v6 syntax
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      
      // Log relevant information for debugging
      console.log("Contract Address:", contractAddress);
      
      // Create contract instance
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      
      try {
        // Get all document hashes from the blockchain
        const hashes = await contract.getAllDocumentHashes();
        console.log("Raw hashes from blockchain:", hashes);
        
        // Handle case where hashes is null or empty
        if (!hashes || hashes.length === 0 || (hashes.length === 1 && hashes[0] === "")) {
          console.log("No documents found");
          setDocuments([]);
          return;
        }
        
        // Filter out empty hashes
        const validHashes = hashes.filter(hash => hash && hash !== "");
        
        // Get metadata for each document
        const documentPromises = validHashes.map(async (hash) => {
          try {
            // Get document metadata from blockchain
            const [title, description, fileType, date] = await contract.getDocumentMetadata(hash);
            
            return {
              ipfsHash: hash,
              title: title || "Document", // Use title from metadata, fallback to "Document"
              description: description || "No description available", // Use description from metadata
              fileType: fileType || "unknown", // Use fileType from metadata
              uploadDate: date || new Date().toISOString() // Use date from metadata
            };
          } catch (err) {
            console.error(`Error fetching metadata for hash ${hash}:`, err);
            return {
              ipfsHash: hash,
              title: "Document", // Default title
              description: "No description available", // Default description
              fileType: "unknown", // Default file type
              uploadDate: new Date().toISOString() // Default date
            };
          }
        });
        
        // Wait for all metadata to be fetched
        const documents = await Promise.all(documentPromises);
        
        console.log("Processed documents:", documents);
        setDocuments(documents);
      } catch (contractError) {
        console.error("Contract interaction error:", contractError);
        setError(`Contract error: ${contractError.message}`);
        setDocuments([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setError(`Failed to fetch documents: ${error.message}`);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentTitle || !documentType) {
      setError('Please fill in all required fields');
      return;
    }

    // Check if user is an approved lawyer before allowing upload
    if (!isApprovedLawyer && userRole === 'lawyer') {
      setError('You need to be an approved lawyer to upload documents. Please apply for approval first.');
      return;
    }

    setUploading(true);
    try {
      // Check if window.ethereum is available
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed or not accessible");
      }
      
      // Upload to IPFS using Pinata API directly
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'pinata_api_key': process.env.REACT_APP_PINATA_API_KEY,
          'pinata_secret_api_key': process.env.REACT_APP_PINATA_SECRET_API_KEY
        }
      });
      
      const ipfsHash = response.data.IpfsHash;
      console.log("IPFS Hash:", ipfsHash);

      // Get contract instance using ethers.js v6 syntax
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      
      // Log important info
      console.log("Contract address:", contractAddress);
      
      // Create contract instance
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      
      // Now try to upload the file
      try {
        console.log("Uploading file...");
        
        const uploadTx = await contract.uploadFile(
          ipfsHash,
          documentTitle,
          documentDescription || "",
          documentType,
          caseId.toString(),
          "", // clientName
          "", // clientEmail
          "", // clientPhone
          "", // clientAddress
          "", // courtName
          "", // judgeName
          new Date().toISOString(), // filingDate
          "ACTIVE" // status
        );
        
        console.log("Upload transaction hash:", uploadTx.hash);
        await uploadTx.wait();
        console.log("File uploaded successfully");
        
        setOpenUpload(false);
        fetchDocuments();
      } catch (err) {
        console.error("Upload transaction error:", err);
        setError("Upload transaction failed: " + err.message);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload document: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (ipfsHash) => {
    try {
      const url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      window.open(url, '_blank');
    } catch (err) {
      setError('Failed to download document');
    }
  };

  const handleDelete = async (documentId) => {
    // Check if user is an approved lawyer before allowing delete
    if (!isApprovedLawyer && userRole === 'lawyer') {
      setError('You need to be an approved lawyer to delete documents.');
      return;
    }

    try {
      // Get contract instance using ethers.js v6 syntax
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      
      // Call the delete function on the blockchain
      const tx = await contract.deleteDocument(documentId);
      await tx.wait();
      
      fetchDocuments();
    } catch (err) {
      setError('Failed to delete document');
    }
  };

  // Redirect to lawyer registration if not approved
  const navigateToLawyerRegistration = () => {
    navigate('/lawyer-registration');
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Case Documents</Typography>
        {userRole === 'lawyer' && (
          <>
            {isApprovedLawyer ? (
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={() => setOpenUpload(true)}
              >
                Upload Document
              </Button>
            ) : (
              <Button
                variant="contained"
                color="warning"
                onClick={navigateToLawyerRegistration}
              >
                Apply for Lawyer Approval
              </Button>
            )}
          </>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {needsApproval && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Your account is not registered as an approved lawyer. You need to apply for approval before uploading documents.
          <Button 
            color="inherit" 
            size="small" 
            onClick={navigateToLawyerRegistration}
            sx={{ ml: 2 }}
          >
            Apply Now
          </Button>
        </Alert>
      )}

      <List>
        {documents.map((doc) => (
          <ListItem key={doc.ipfsHash} divider>
            <ListItemText
              primary={
                <Box display="flex" alignItems="center" gap={1}>
                  {doc.title}
                  <Tooltip title="Verified on Blockchain">
                    <VerifiedIcon color="success" fontSize="small" />
                  </Tooltip>
                </Box>
              }
              secondary={
                <>
                  <Typography component="span" variant="body2" color="text.primary">
                    {doc.fileType}
                  </Typography>
                  {` — ${doc.description}`}
                </>
              }
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="download"
                onClick={() => handleDownload(doc.ipfsHash)}
              >
                <DownloadIcon />
              </IconButton>
              {userRole === 'lawyer' && isApprovedLawyer && (
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDelete(doc.ipfsHash)}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Dialog open={openUpload} onClose={() => setOpenUpload(false)}>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Document Title"
            fullWidth
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Document Type"
            fullWidth
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={documentDescription}
            onChange={(e) => setDocumentDescription(e.target.value)}
          />
          <Button
            variant="contained"
            component="label"
            fullWidth
            sx={{ mt: 2 }}
          >
            Select File
            <input
              type="file"
              hidden
              onChange={handleFileSelect}
            />
          </Button>
          {selectedFile && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Selected file: {selectedFile.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUpload(false)}>Cancel</Button>
          <Button
            onClick={handleUpload}
            disabled={uploading}
            variant="contained"
          >
            {uploading ? <CircularProgress size={24} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default CaseDocuments; 