import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CSS/CaseForm.css";

const CaseForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [caseTypes] = useState(["Civil", "Criminal", "Family", "Corporate"]);
  const [status] = useState(["Open", "In Progress", "Closed"]);

  const [caseData, setCaseData] = useState({
    // Step 1 - Basic Information
    clientName: "",
    clientEmail: "",
    caseTitle: "",
    caseType: "Civil",
    status: "Open",
    filingDate: new Date().toISOString().split("T")[0],
    // Step 2 - Case Description
    caseDescription: "",
    summary: "",
    // Step 3 - Opposing Party & Court Details
    partiesInvolved: {
      opposingPartyName: "",
      opposingCounsel: ""
    },
    courtDetails: {
      courtName: "",
      judgeName: ""
    }
  });

  // Handle simple and nested changes (for nested keys like "partiesInvolved.opposingPartyName")
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setCaseData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setCaseData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const nextStep = () => {
    // Optionally add validation for the current step before continuing
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/api/cases/create",
        caseData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess(true);
      setLoading(false);

      // Redirect to the case details page after a short delay
      setTimeout(() => {
        navigate(`/case/${response.data._id}`);
      }, 2000);
    } catch (err) {
      setLoading(false);
      if (err.response) {
        setError(err.response.data.message || "Failed to create case");
      } else {
        setError("Network error. Please try again.");
      }
    }
  };

  // Render the form sections conditionally based on currentStep
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="form-section-case">
            <h3>Basic Information</h3>
            <div className="form-group">
              <label htmlFor="clientName">Client Name *</label>
              <input
                type="text"
                id="clientName"
                name="clientName"
                value={caseData.clientName}
                onChange={handleChange}
                required
                placeholder="Enter client's full name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="clientEmail">Client Email *</label>
              <input
                type="email"
                id="clientEmail"
                name="clientEmail"
                value={caseData.clientEmail}
                onChange={handleChange}
                required
                placeholder="Enter client's email address"
              />
            </div>

            <div className="form-group">
              <label htmlFor="caseTitle">Case Title *</label>
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
              <label htmlFor="caseType">Case Type *</label>
              <select
                id="caseType"
                name="caseType"
                value={caseData.caseType}
                onChange={handleChange}
                required
              >
                {caseTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={caseData.status}
                onChange={handleChange}
              >
                {status.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="filingDate">Filing Date</label>
              <input
                type="date"
                id="filingDate"
                name="filingDate"
                value={caseData.filingDate}
                onChange={handleChange}
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="form-section-case">
            <h3>Case Description</h3>
            <div className="form-group">
              <label htmlFor="caseDescription">Description *</label>
              <textarea
                id="caseDescription"
                name="caseDescription"
                value={caseData.caseDescription}
                onChange={handleChange}
                rows="4"
                required
              ></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="summary">Summary</label>
              <textarea
                id="summary"
                name="summary"
                value={caseData.summary}
                onChange={handleChange}
                rows="3"
              ></textarea>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="form-section-case">
            <h3>Opposing Party & Court Information</h3>
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
        );
      default:
        return null;
    }
  };

  return (
    <div className="case-form-container">
      <h2>Create New Case</h2>

      {error && <div className="error-message">{error}</div>}
      {success && (
        <div className="success-message">Case created successfully!</div>
      )}

      <form
        onSubmit={currentStep === 3 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}
        className="case-form"
      >
        {renderStep()}

        <div className="form-actions">
          {currentStep > 1 && (
            <button
              type="button"
              className="prev-button"
              onClick={prevStep}
              disabled={loading}
            >
              Back
            </button>
          )}
          {currentStep < 3 && (
            <button
              type="button"
              className="next-button"
              onClick={nextStep}
              disabled={loading}
            >
              Next
            </button>
          )}
          {currentStep === 3 && (
            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Case"}
            </button>
          )}
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate("/lawyer-dashboard")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CaseForm;
