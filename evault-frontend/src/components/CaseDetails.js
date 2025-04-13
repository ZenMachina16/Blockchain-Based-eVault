import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import "./CSS/CaseDetails.css";

const CaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchCaseDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        // Get user info
        const userResponse = await axios.get("http://localhost:5000/auth/current-user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserRole(userResponse.data.role);

        // Fetch case details
        const response = await axios.get(`http://localhost:5000/api/cases/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setCaseData(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch case details");
        setLoading(false);
      }
    };

    fetchCaseDetails();
  }, [id, navigate]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
        <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Container>
    );
  }

  if (!caseData) {
    return (
      <Container>
        <Alert severity="info" sx={{ mt: 2 }}>
          Case not found
        </Alert>
        <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            {caseData.caseTitle}
          </Typography>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            Back
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Case Type
              </Typography>
              <Typography>{caseData.caseType}</Typography>
            </Box>
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Status
              </Typography>
              <Typography>{caseData.status}</Typography>
            </Box>
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Filing Date
              </Typography>
              <Typography>{formatDate(caseData.filingDate)}</Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Client Information
            </Typography>
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Client Name
              </Typography>
              <Typography>{caseData.clientName}</Typography>
            </Box>
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Client Email
              </Typography>
              <Typography>{caseData.clientEmail}</Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Case Description
            </Typography>
            <Typography>{caseData.caseDescription}</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Opposing Party Information
            </Typography>
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Opposing Party Name
              </Typography>
              <Typography>
                {caseData.partiesInvolved?.opposingPartyName || "Not specified"}
              </Typography>
            </Box>
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Opposing Counsel
              </Typography>
              <Typography>
                {caseData.partiesInvolved?.opposingCounsel || "Not specified"}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Court Information
            </Typography>
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Court Name
              </Typography>
              <Typography>
                {caseData.courtDetails?.courtName || "Not specified"}
              </Typography>
            </Box>
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Judge Name
              </Typography>
              <Typography>
                {caseData.courtDetails?.judgeName || "Not specified"}
              </Typography>
            </Box>
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Case Number
              </Typography>
              <Typography>
                {caseData.courtDetails?.caseNumber || "Not specified"}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {userRole === "lawyer" && (
          <Box mt={3} display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(`/edit-case/${id}`)}
            >
              Edit Case
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default CaseDetails;
