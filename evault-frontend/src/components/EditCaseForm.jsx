import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./CSS/CaseManagementForm.css";

const EditCaseForm = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [caseData, setCaseData] = useState({
    clientName: "",
    clientEmail: "",
    caseTitle: "",
    caseDescription: "",
    caseType: "",
    status: "",
    summary: "",
    filingDate: "",
    partiesInvolved: {
      opposingPartyName: "",
      opposingCounsel: "",
    },
    courtDetails: {
      courtName: "",
      judgeName: "",
    },
  });

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

        const response = await axios.get(
          `http://localhost:5000/api/cases/${caseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setCaseData(response.data);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested objects
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setCaseData({
        ...caseData,
        [parent]: {
          ...caseData[parent],
          [child]: value,
        },
      });
    } else {
      setCaseData({
        ...caseData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        navigate("/login");
        return;
      }

      await axios.put(
        `http://localhost:5000/api/cases/${caseId}`,
        caseData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSuccess(true);
      setLoading(false);
      
      // Redirect to case details page after successful update
      setTimeout(() => {
        navigate(`/case-details/${caseId}`);
      }, 2000);
    } catch (err) {
      setLoading(false);
      if (err.response) {
        setError(err.response.data.message || "Failed to update case");
      } else {
        setError("Network error. Please try again.");
      }
    }
  };

  if (loading) return <div className="loading">Loading case details...</div>;

  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="case-form-container">
      <h2>Edit Case</h2>
      {success && (
        <div className="success-message">
          Case updated successfully! Redirecting...
        </div>
      )}
      <form onSubmit={handleSubmit} className="case-form">
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-group">
            <label htmlFor="clientName">Client Name</label>
            <input
              type="text"
              id="clientName"
              name="clientName"
              value={caseData.clientName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="clientEmail">Client Email</label>
            <input
              type="email"
              id="clientEmail"
              name="clientEmail"
              value={caseData.clientEmail}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="caseTitle">Case Title</label>
            <input
              type="text"
              id="caseTitle"
              name="caseTitle"
              value={caseData.caseTitle}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="caseType">Case Type</label>
            <select
              id="caseType"
              name="caseType"
              value={caseData.caseType}
              onChange={handleChange}
              required
            >
              <option value="">Select Case Type</option>
              <option value="Civil">Civil</option>
              <option value="Criminal">Criminal</option>
              <option value="Family">Family</option>
              <option value="Corporate">Corporate</option>
              <option value="Immigration">Immigration</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={caseData.status}
              onChange={handleChange}
              required
            >
              <option value="">Select Status</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Closed">Closed</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="filingDate">Filing Date</label>
            <input
              type="date"
              id="filingDate"
              name="filingDate"
              value={caseData.filingDate ? caseData.filingDate.split('T')[0] : ""}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Case Description</h3>
          <div className="form-group">
            <label htmlFor="caseDescription">Description</label>
            <textarea
              id="caseDescription"
              name="caseDescription"
              value={caseData.caseDescription}
              onChange={handleChange}
              rows="5"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="summary">Summary</label>
            <textarea
              id="summary"
              name="summary"
              value={caseData.summary}
              onChange={handleChange}
              rows="3"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Opposing Party Information</h3>
          <div className="form-group">
            <label htmlFor="partiesInvolved.opposingPartyName">
              Opposing Party Name
            </label>
            <input
              type="text"
              id="partiesInvolved.opposingPartyName"
              name="partiesInvolved.opposingPartyName"
              value={caseData.partiesInvolved.opposingPartyName}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="partiesInvolved.opposingCounsel">
              Opposing Counsel
            </label>
            <input
              type="text"
              id="partiesInvolved.opposingCounsel"
              name="partiesInvolved.opposingCounsel"
              value={caseData.partiesInvolved.opposingCounsel}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Court Information</h3>
          <div className="form-group">
            <label htmlFor="courtDetails.courtName">Court Name</label>
            <input
              type="text"
              id="courtDetails.courtName"
              name="courtDetails.courtName"
              value={caseData.courtDetails.courtName}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="courtDetails.judgeName">Judge Name</label>
            <input
              type="text"
              id="courtDetails.judgeName"
              name="courtDetails.judgeName"
              value={caseData.courtDetails.judgeName}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Case"}
          </button>
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate(`/case-details/${caseId}`)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCaseForm; 