import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./CSS/CaseDetails.css";

const CaseDetails = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const fetchCaseDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication required");
          setLoading(false);
          navigate("/login");
          return;
        }

        // Get user info to check authorization
        const userResponse = await axios.get(
          "http://localhost:5000/auth/current-user",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUserRole(userResponse.data.role);
        setUserEmail(userResponse.data.email);

        // Fetch case details
        const caseResponse = await axios.get(
          `http://localhost:5000/api/cases/${caseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setCaseData(caseResponse.data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        if (err.response) {
          setError(err.response.data.message || "Failed to load case details");
        } else {
          setError("Network error. Please try again.");
        }
      }
    };

    fetchCaseDetails();
  }, [caseId, navigate]);

  // Check if user has access to this case
  const hasAccess = () => {
    if (!caseData || !userRole || !userEmail) return false;

    // Lawyers can access all cases
    if (userRole === "lawyer") return true;

    // Clients can only access their own cases
    if (userRole === "client" && caseData.clientEmail === userEmail)
      return true;

    return false;
  };

  if (loading) return <div className="loading">Loading case details...</div>;

  if (error) return <div className="error-message">{error}</div>;

  if (!hasAccess()) {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You do not have permission to view this case.</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  if (!caseData) return <div className="error-message">Case not found</div>;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="case-details-container">
      <div className="case-details-header">
        <h2>{caseData.caseTitle}</h2>
        <div className="case-status">
          <span className={`status-badge ${caseData.status.toLowerCase()}`}>
            {caseData.status}
          </span>
        </div>
      </div>

      <div className="case-details-content">
        <div className="case-details-section">
          <h3>Basic Information</h3>
          <div className="detail-item">
            <span className="detail-label">Case Type:</span>
            <span className="detail-value">{caseData.caseType}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Filing Date:</span>
            <span className="detail-value">
              {formatDate(caseData.filingDate)}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Client Name:</span>
            <span className="detail-value">{caseData.clientName}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Client Email:</span>
            <span className="detail-value">{caseData.clientEmail}</span>
          </div>
        </div>

        <div className="case-details-section">
          <h3>Case Description</h3>
          <p className="case-description">{caseData.caseDescription}</p>
          {caseData.summary && (
            <div className="case-summary">
              <h4>Summary</h4>
              <p>{caseData.summary}</p>
            </div>
          )}
        </div>

        <div className="case-details-section">
          <h3>Opposing Party Information</h3>
          <div className="detail-item">
            <span className="detail-label">Opposing Party:</span>
            <span className="detail-value">
              {caseData.partiesInvolved?.opposingPartyName || "Not specified"}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Opposing Counsel:</span>
            <span className="detail-value">
              {caseData.partiesInvolved?.opposingCounsel || "Not specified"}
            </span>
          </div>
        </div>

        <div className="case-details-section">
          <h3>Court Information</h3>
          <div className="detail-item">
            <span className="detail-label">Court Name:</span>
            <span className="detail-value">
              {caseData.courtDetails?.courtName || "Not specified"}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Judge Name:</span>
            <span className="detail-value">
              {caseData.courtDetails?.judgeName || "Not specified"}
            </span>
          </div>
        </div>
      </div>

      <div className="case-details-actions">
        {userRole === "lawyer" && (
          <button
            className="edit-button"
            onClick={() => navigate(`/edit-case/${caseId}`)}
          >
            Edit Case
          </button>
        )}
        <button className="back-button" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    </div>
  );
};

export default CaseDetails;
