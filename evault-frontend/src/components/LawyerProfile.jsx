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
  MenuItem,
  Select,
  InputLabel,
  FormControl,
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
  const [userAddress, setUserAddress] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  const [isLawyer, setIsLawyer] = useState(false);
  
  const [profileData, setProfileData] = useState({
    fullName: "",
    barId: "",
    email: "",
    phone: "",
    specialization: "",
    yearsOfExperience: "",
    firmName: "",
    officeAddress: "",
    bio: ""
  });

  const isEditMode = location.state?.mode === 'edit';

  useEffect(() => {
    fetchProfile();
    checkLawyerStatus();
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

  const checkLawyerStatus = async () => {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed. Please install it to continue.");
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      let accounts = await provider.listAccounts();
      
      if (accounts.length === 0) {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          accounts = await provider.listAccounts();
        } catch (connErr) {
          throw new Error('Failed to connect to MetaMask');
        }
      }
      
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setUserAddress(address);
      
      // Get contract address from .env
      const contractAddr = process.env.REACT_APP_NAVINEVAULT_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
      setContractAddress(contractAddr);
      
      const contract = new ethers.Contract(contractAddr, contractABI, signer);
      
      // Check if user is a lawyer
      const lawyerStatus = await contract.isLawyer(address);
      setIsLawyer(lawyerStatus);
      
      if (!lawyerStatus) {
        setError("You are not registered as a lawyer. Please apply first.");
      }
      
      // Load existing data if available
      try {
        const details = await contract.getLawyerApplicationDetails(address);
        setProfileData(prev => ({
          ...prev, 
          fullName: details.name || "",
          barId: details.barNumber || "",
          email: details.email || ""
        }));
      } catch (error) {
        console.error("Error loading lawyer details:", error);
      }
      
    } catch (err) {
      console.error("Error checking lawyer status:", err);
      setError(err.message || "Failed to check lawyer status");
    }
  };

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const submitProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Basic validation
      const requiredFields = ['fullName', 'barId', 'email', 'phone', 'specialization'];
      for (const field of requiredFields) {
        if (!profileData[field]) {
          throw new Error(`Please fill in your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        }
      }
      
      // In a real application, we would save this profile data to the blockchain
      // For now, we're just simulating success
      
      console.log("Profile data to save:", profileData);
      
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(true);
      
      // Redirect to lawyer dashboard after 2 seconds
      setTimeout(() => {
        navigate("/lawyer-dashboard");
      }, 2000);
      
    } catch (err) {
      console.error("Error submitting profile:", err);
      setError(err.message || "Failed to submit profile");
    } finally {
      setLoading(false);
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

  if (!isLawyer && !loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          You are not registered as a lawyer. Please complete the lawyer application process first.
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2, ml: 2 }}
            onClick={() => navigate("/lawyer-registration")}
          >
            Go to Registration
          </Button>
        </Alert>
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

        <form onSubmit={submitProfile}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="fullName"
                value={profileData.fullName}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bar ID/License Number"
                name="barId"
                value={profileData.barId}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={profileData.email}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={profileData.phone}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Professional Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Specialization</InputLabel>
                <Select
                  name="specialization"
                  value={profileData.specialization}
                  label="Specialization"
                  onChange={handleChange}
                >
                  <MenuItem value="Corporate Law">Corporate Law</MenuItem>
                  <MenuItem value="Criminal Law">Criminal Law</MenuItem>
                  <MenuItem value="Family Law">Family Law</MenuItem>
                  <MenuItem value="Intellectual Property">Intellectual Property</MenuItem>
                  <MenuItem value="Real Estate">Real Estate</MenuItem>
                  <MenuItem value="Tax Law">Tax Law</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Years of Experience"
                name="yearsOfExperience"
                type="number"
                value={profileData.yearsOfExperience}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Firm Name"
                name="firmName"
                value={profileData.firmName}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Office Address"
                name="officeAddress"
                value={profileData.officeAddress}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Professional Bio"
                name="bio"
                value={profileData.bio}
                onChange={handleChange}
                multiline
                rows={4}
                placeholder="Tell clients about your background, experience, and approach"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" mt={2}>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/")}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={submitProfile}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : "Save Profile"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default LawyerProfile;
