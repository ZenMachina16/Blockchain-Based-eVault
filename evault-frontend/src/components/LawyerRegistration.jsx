import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel
} from "@mui/material";
import contractABI from "../contractABI";

const LawyerRegistration = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [userAddress, setUserAddress] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  const [applicationStatus, setApplicationStatus] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    barNumber: "",
    email: "",
    additionalInfo: ""
  });

  // Check if user has a pending application
  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (!userAddress || !contractAddress) return;
      
      try {
        console.log("Checking application status for address:", userAddress);
        console.log("Contract address:", contractAddress);
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        
        // Check if already a lawyer
        const isLawyer = await contract.isLawyer(userAddress);
        console.log("Is lawyer:", isLawyer);
        
        if (isLawyer) {
          setApplicationStatus("approved");
          return;
        }
        
        // Check if there's a pending application
        try {
          const isPending = await contract.pendingLawyers(userAddress);
          console.log("Is pending:", isPending);
          
          if (isPending) {
            setApplicationStatus("pending");
            return;
          }
          
          // Try to get application details
          const application = await contract.lawyerApplications(userAddress);
          console.log("Application data:", application);
          
          if (application && application.applicationDate && application.applicationDate > 0) {
            if (application.isReviewed) {
              setApplicationStatus(application.isApproved ? "approved" : "rejected");
            } else {
              setApplicationStatus("pending");
            }
          } else {
            setApplicationStatus("none");
          }
        } catch (err) {
          console.log("No application found or error in checking:", err);
          setApplicationStatus("none");
        }
      } catch (err) {
        console.error("Error checking application status:", err);
        setError("Failed to check application status");
        setApplicationStatus("none");
      }
    };
    
    if (userAddress && contractAddress) {
      checkApplicationStatus();
    }
  }, [userAddress, contractAddress]);

  // Connect to MetaMask
  const connectWallet = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed. Please install it to continue.");
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      // Get contract address from .env or use hardcoded value for testing
      const contractAddr = process.env.REACT_APP_NAVINEVAULT_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
      
      console.log("Connected wallet address:", address);
      console.log("Using contract address:", contractAddr);
      
      setUserAddress(address);
      setContractAddress(contractAddr);
      setWalletConnected(true);
      setActiveStep(1);
    } catch (err) {
      console.error("Error connecting wallet:", err);
      setError(err.message || "Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Submit lawyer application
  const submitApplication = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate form data
      if (!formData.name || !formData.barNumber || !formData.email) {
        throw new Error("Please fill all required fields");
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      
      console.log("Submitting application with data:", formData);
      
      // Submit application to the contract
      const tx = await contract.requestLawyerStatus(
        formData.name,
        formData.barNumber,
        formData.email,
        formData.additionalInfo || ""
      );
      
      console.log("Transaction submitted:", tx.hash);
      await tx.wait();
      console.log("Application submitted successfully");
      
      setSuccess(true);
      setActiveStep(2);
      setApplicationStatus("pending");
    } catch (err) {
      console.error("Error submitting application:", err);
      setError(err.message || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  // Render appropriate content based on application status
  const renderStatusContent = () => {
    switch (applicationStatus) {
      case "none":
        return (
          <Alert severity="info">
            You don't have any active lawyer applications. Please fill the form to apply.
          </Alert>
        );
      case "pending":
        return (
          <Alert severity="warning">
            Your application is currently under review. You'll be notified once it's processed.
          </Alert>
        );
      case "approved":
        return (
          <Alert severity="success">
            Congratulations! Your application has been approved. Please complete your lawyer profile to access lawyer features.
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => navigate("/lawyer-profile")}
              >
                Complete Profile
              </Button>
              <Button 
                variant="outlined" 
                color="primary"
                onClick={() => navigate("/lawyer-dashboard")}
              >
                Skip to Dashboard
              </Button>
            </Box>
          </Alert>
        );
      case "rejected":
        return (
          <Alert severity="error">
            Your application was not approved. You can submit a new application with updated information.
            <Button 
              variant="contained" 
              color="primary" 
              sx={{ mt: 2 }}
              onClick={() => {
                setFormData({
                  name: "",
                  barNumber: "",
                  email: "",
                  additionalInfo: ""
                });
                setApplicationStatus("none");
                setActiveStep(1);
              }}
            >
              Submit New Application
            </Button>
          </Alert>
        );
      default:
        return null;
    }
  };

  const steps = ['Connect Wallet', 'Submit Application', 'Application Status'];

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: "auto", mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Lawyer Registration
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Step 1: Connect Wallet */}
        {activeStep === 0 && (
          <Box textAlign="center">
            <Typography variant="body1" paragraph>
              To register as a lawyer, you need to connect your Ethereum wallet.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={connectWallet}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Connect Wallet"}
            </Button>
          </Box>
        )}

        {/* Step 2: Application Form */}
        {activeStep === 1 && (applicationStatus === "none" || applicationStatus === null) && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bar License Number"
                name="barNumber"
                value={formData.barNumber}
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
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Additional Information"
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleChange}
                multiline
                rows={4}
                helperText="Please provide any additional information that may support your application"
              />
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between">
                <Button
                  variant="outlined"
                  onClick={() => setActiveStep(0)}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={submitApplication}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : "Submit Application"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        )}

        {/* Step 3: Application Status */}
        {(activeStep === 2 || (applicationStatus && applicationStatus !== "none")) && (
          <Box>
            {renderStatusContent()}
            {applicationStatus !== "approved" && (
              <Button
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() => navigate("/")}
              >
                Return to Home
              </Button>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default LawyerRegistration; 