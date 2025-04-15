import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

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
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Get user info
        const userResponse = await axios.get("http://localhost:5000/api/auth/current-user", {
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
      } catch (error) {
        console.error('Error fetching case details:', error);
        setError(error.response?.data?.message || 'Failed to fetch case details');
        setLoading(false);
      }
    };

    fetchCaseDetails();
  }, [id, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!caseData) {
    return <div>No case data found</div>;
  }

  return (
    <div>
      <h2>{caseData.caseTitle}</h2>
      <p>Case Number: {caseData.caseNumber}</p>
      <p>Status: {caseData.status}</p>
      <p>Description: {caseData.caseDescription}</p>
    </div>
  );
};

export default CaseDetails; 