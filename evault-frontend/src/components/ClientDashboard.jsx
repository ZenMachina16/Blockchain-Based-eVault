import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  Chip,
  useTheme,
  alpha,
} from "@mui/material";
import "./CSS/ClientDashboard.css";
import { Description as DescriptionIcon, Add as AddIcon } from '@mui/icons-material';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get("http://localhost:5000/api/cases/client", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setCases(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch cases");
        setLoading(false);
      }
    };

    fetchCases();
  }, [navigate]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return theme.palette.success.main;
      case 'pending':
        return theme.palette.warning.main;
      case 'closed':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const handleCaseClick = (caseId) => {
    navigate(`/case/${caseId}`);
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
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          My Cases
        </Typography>
       
      </Box>

      {cases.length === 0 ? (
        <Alert severity="info">You don't have any cases yet.</Alert>
      ) : (
        <Grid container spacing={3}>
          {cases.map((caseItem) => (
            <Grid item xs={12} md={6} lg={4} key={caseItem._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {caseItem.caseTitle}
                    </Typography>
                    <Chip
                      label={caseItem.status}
                      size="small"
                      sx={{
                        backgroundColor: alpha(getStatusColor(caseItem.status), 0.1),
                        color: getStatusColor(caseItem.status),
                        fontWeight: 'medium',
                      }}
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" paragraph>
                    {caseItem.caseDescription}
                  </Typography>

                  <Box mt={2}>
                    <Typography variant="body2" color="text.secondary">
                      Case Type: {caseItem.caseType}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Filing Date: {new Date(caseItem.filingDate).toLocaleDateString()}
                    </Typography>
                  </Box>

                  <Box mt={3}>
                    <Button
                      variant="outlined"
                      startIcon={<DescriptionIcon />}
                      onClick={() => handleCaseClick(caseItem._id)}
                      fullWidth
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        borderColor: theme.palette.primary.main,
                        '&:hover': {
                          borderColor: theme.palette.primary.dark,
                          backgroundColor: alpha(theme.palette.primary.main, 0.04),
                        },
                      }}
                    >
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default ClientDashboard;
