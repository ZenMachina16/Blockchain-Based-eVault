import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Avatar,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useLocation, useNavigate } from "react-router-dom";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import axios from "axios";
import { ethers } from "ethers";
import contractABI from "../contractABI";

const LawyerProfile = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profile, setProfile] = useState({
    name: "",
    lawyerId: "",
    barRegistrationNo: "",
    yearsOfExperience: "",
    bio: "",
    email: "",
    location: "",
    profilePicture: "",
  });
  const [documents, setDocuments] = useState([]);

  const isEditMode = location.state?.mode === 'edit';
  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/lawyer/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load profile");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put("http://localhost:5000/api/lawyer/profile", profile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Profile updated successfully");
      setError("");
      setTimeout(() => navigate('/lawyer-dashboard'), 2000);
    } catch (err) {
      setError("Failed to update profile");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size should be less than 5MB");
        return;
      }

      const formData = new FormData();
      formData.append("profilePicture", file);

      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
          "http://localhost:5000/api/lawyer/profile/picture",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const profilePicture = `http://localhost:5000${response.data.profilePicture}`;
        setProfile(prev => ({ ...prev, profilePicture }));
        setSuccess("Profile picture updated successfully");
      } catch (err) {
        setError("Failed to upload profile picture. " +
          (err.response?.data?.message || err.message || "Unknown error occurred")
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      
      // Connect to blockchain
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      
      // Get all document hashes from the blockchain
      // This would require a function in your smart contract to return all document hashes
      const documentHashes = await contract.getAllDocumentHashes();
      
      // Process each document
      const documents = await Promise.all(
        documentHashes.map(async (hash) => {
          // Get document metadata from blockchain
          const metadata = await contract.getDocumentMetadata(hash);
          
          return {
            ipfsHash: hash,
            title: metadata.title,
            description: metadata.description,
            type: metadata.type,
            date: metadata.date,
            isVerified: true // Always verified since it's from the blockchain
          };
        })
      );
      
      setDocuments(documents);
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch documents from blockchain');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mt: 4,
          backgroundColor: "#ffffff",
          borderRadius: 2,
          '& .MuiTextField-root': {
            backgroundColor: '#ffffff',
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.98)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(0, 0, 0, 0.87)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#1976d2',
              },
            },
            '& .MuiInputLabel-root': {
              color: 'rgba(0, 0, 0, 0.87)',
            },
            '& .MuiInputBase-input': {
              color: 'rgba(0, 0, 0, 0.87)',
            },
          },
        }}
      >
        <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={profile.profilePicture || "/default-avatar.png"}
              sx={{
                width: 120,
                height: 120,
                mb: 2,
                cursor: isEditMode ? "pointer" : "default",
                border: `2px solid ${theme.palette.primary.main}`,
              }}
            />
            {isEditMode && (
              <IconButton
                color="primary"
                aria-label="upload picture"
                component="label"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: "#ffffff",
                  boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
                  '&:hover': {
                    backgroundColor: theme.palette.grey[100],
                  },
                }}
              >
                <input
                  hidden
                  accept="image/*"
                  type="file"
                  onChange={handleImageUpload}
                />
                <PhotoCamera />
              </IconButton>
            )}
          </Box>
          <Typography variant="h4" gutterBottom sx={{ color: 'rgba(0, 0, 0, 0.87)' }}>
            Lawyer Profile
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
            {isEditMode ? "Edit your profile information" : "View your profile information"}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={profile.name}
                onChange={handleChange}
                disabled={!isEditMode}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Lawyer ID"
                name="lawyerId"
                value={profile.lawyerId}
                onChange={handleChange}
                disabled={!isEditMode}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bar Registration Number"
                name="barRegistrationNo"
                value={profile.barRegistrationNo}
                onChange={handleChange}
                disabled={!isEditMode}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Years of Experience"
                name="yearsOfExperience"
                type="number"
                value={profile.yearsOfExperience}
                onChange={handleChange}
                disabled={!isEditMode}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={profile.email}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={profile.location}
                onChange={handleChange}
                disabled={!isEditMode}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bio"
                name="bio"
                multiline
                rows={4}
                value={profile.bio}
                onChange={handleChange}
                disabled={!isEditMode}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button
              variant="outlined"
              onClick={() => navigate('/lawyer-dashboard')}
              sx={{
                color: theme.palette.primary.main,
                borderColor: theme.palette.primary.main,
                '&:hover': {
                  borderColor: theme.palette.primary.dark,
                  backgroundColor: 'rgba(25, 118, 210, 0.04)',
                },
              }}
            >
              Back to Dashboard
            </Button>
            {isEditMode && (
              <Button
                variant="contained"
                type="submit"
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                }}
              >
                Save Changes
              </Button>
            )}
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default LawyerProfile;
