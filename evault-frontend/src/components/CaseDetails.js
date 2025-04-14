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
  Chip,
  useTheme,
  alpha,
  Divider,
} from "@mui/material";
import {
  Person as PersonIcon,
  Description as DescriptionIcon,
  Gavel as GavelIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";
import CaseDocuments from "./CaseDocuments";
import "./CSS/CaseDetails.css";

const CaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const theme = useTheme();

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
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'open':
        return theme.palette.success.main;
      case 'pending':
      case 'in progress':
        return theme.palette.warning.main;
      case 'closed':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
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
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 2,
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.shadows[1],
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            {caseData.caseTitle}
          </Typography>
          <Chip
            label={caseData.status}
            sx={{
              backgroundColor: alpha(getStatusColor(caseData.status), 0.1),
              color: getStatusColor(caseData.status),
              fontWeight: 'medium',
              px: 2,
            }}
          />
        </Box>

        <Grid container spacing={4}>
          {/* Basic Information */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
              }}
            >
              <Box display="flex" alignItems="center" mb={2}>
                <DescriptionIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="h6" fontWeight="medium">
                  Basic Information
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Case Type: {caseData.caseType || "Not specified"}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Filing Date: {formatDate(caseData.filingDate)}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Case Number: {caseData.courtDetails?.caseNumber || "Not specified"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Status: {caseData.status || "Not specified"}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Client Information */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.info.main, 0.04),
              }}
            >
              <Box display="flex" alignItems="center" mb={2}>
                <PersonIcon sx={{ mr: 1, color: theme.palette.info.main }} />
                <Typography variant="h6" fontWeight="medium">
                  Client Information
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Name: {caseData.clientName || "Not specified"}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Email: {caseData.clientEmail || "Not specified"}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Case Description */}
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.warning.main, 0.04),
              }}
            >
              <Box display="flex" alignItems="center" mb={2}>
                <DescriptionIcon sx={{ mr: 1, color: theme.palette.warning.main }} />
                <Typography variant="h6" fontWeight="medium">
                  Case Description
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" color="text.secondary" paragraph>
                {caseData.caseDescription || "No description provided"}
              </Typography>
              
              {caseData.summary && (
                <>
                  <Typography variant="subtitle1" fontWeight="medium" mt={2} mb={1}>
                    Summary
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {caseData.summary}
                  </Typography>
                </>
              )}
            </Paper>
          </Grid>

          {/* Opposing Party Information */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.error.main, 0.04),
              }}
            >
              <Box display="flex" alignItems="center" mb={2}>
                <PersonIcon sx={{ mr: 1, color: theme.palette.error.main }} />
                <Typography variant="h6" fontWeight="medium">
                  Opposing Party
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Name: {caseData.partiesInvolved?.opposingPartyName || "Not specified"}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Counsel: {caseData.partiesInvolved?.opposingCounsel || "Not specified"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Contact: {caseData.partiesInvolved?.opposingContact || "Not specified"}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Court Information */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.success.main, 0.04),
              }}
            >
              <Box display="flex" alignItems="center" mb={2}>
                <GavelIcon sx={{ mr: 1, color: theme.palette.success.main }} />
                <Typography variant="h6" fontWeight="medium">
                  Court Information
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Court Name: {caseData.courtDetails?.courtName || "Not specified"}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Judge: {caseData.courtDetails?.judgeName || "Not specified"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Case Number: {caseData.courtDetails?.caseNumber || "Not specified"}
                </Typography>
              </Box>
            </Paper>
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

        <CaseDocuments caseId={id} userRole={userRole} />
      </Paper>
    </Container>
  );
};

export default CaseDetails;
