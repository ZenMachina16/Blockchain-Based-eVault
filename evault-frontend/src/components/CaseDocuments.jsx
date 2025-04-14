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
} from '@mui/material';
import { Delete as DeleteIcon, Download as DownloadIcon, Upload as UploadIcon } from '@mui/icons-material';
import axios from 'axios';
import { create } from 'ipfs-http-client';
import { BrowserProvider, Contract } from 'ethers';
import yourContractABI from '../contractABI';

const CaseDocuments = ({ caseId, userRole }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openUpload, setOpenUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentDescription, setDocumentDescription] = useState('');
  const [documentType, setDocumentType] = useState('');

  // Configure IPFS with Pinata
  const ipfs = create({
    url: 'https://api.pinata.cloud',
    headers: {
      pinata_api_key: process.env.REACT_APP_PINATA_API_KEY,
      pinata_secret_api_key: process.env.REACT_APP_PINATA_SECRET_API_KEY
    }
  });

  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

  useEffect(() => {
    fetchDocuments();
  }, [caseId]);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/cases/${caseId}/documents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocuments(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch documents');
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

    setUploading(true);
    try {
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

      // Get contract instance
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, yourContractABI, signer);

      // Get the signer's address for the linkedClients array
      const signerAddress = await signer.getAddress();
      
      // Upload document metadata to blockchain
      const tx = await contract.uploadFile(
        ipfsHash,
        documentTitle,
        new Date().toISOString(),
        caseId.toString(),
        'Legal Document',
        documentType,
        [signerAddress] // Use the signer's address instead of caseId
      );

      await tx.wait();

      // Save document reference in backend
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/cases/${caseId}/documents`,
        {
          title: documentTitle,
          description: documentDescription,
          type: documentType,
          ipfsHash: ipfsHash,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setOpenUpload(false);
      fetchDocuments();
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload document: ' + (err.response?.data?.message || err.message));
    }
    setUploading(false);
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
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/cases/${caseId}/documents/${documentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDocuments();
    } catch (err) {
      setError('Failed to delete document');
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Case Documents</Typography>
        {userRole === 'lawyer' && (
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => setOpenUpload(true)}
          >
            Upload Document
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <List>
        {documents.map((doc) => (
          <ListItem key={doc._id} divider>
            <ListItemText
              primary={doc.title}
              secondary={
                <>
                  <Typography component="span" variant="body2" color="text.primary">
                    {doc.type}
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
              {userRole === 'lawyer' && (
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDelete(doc._id)}
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