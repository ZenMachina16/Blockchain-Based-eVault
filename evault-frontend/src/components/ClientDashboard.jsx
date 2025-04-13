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
} from "@mui/material";
import "./CSS/ClientDashboard.css";

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Cases
      </Typography>

      {cases.length === 0 ? (
        <Alert severity="info">You don't have any cases yet.</Alert>
      ) : (
        <Grid container spacing={3}>
          {cases.map((caseItem) => (
            <Grid item xs={12} md={6} lg={4} key={caseItem._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h2">
                    {caseItem.caseTitle}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    Case Type: {caseItem.caseType}
                  </Typography>
                  <Typography variant="body2">
                    Status: {caseItem.status}
                  </Typography>
                  <Typography variant="body2">
                    Filing Date: {formatDate(caseItem.filingDate)}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => navigate(`/case/${caseItem._id}`)}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default ClientDashboard;
