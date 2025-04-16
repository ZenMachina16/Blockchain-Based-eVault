import React, { useState } from "react";
import axios from "axios";
import "./CSS/UploadPage.css"; // Importing the external CSS file

function UploadPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  // Handle file selection via input change or drop event
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
    setSuccess(false);
  };

  // Drag and drop event handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
      setSuccess(false);
      e.dataTransfer.clearData();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://localhost:5001/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          responseType: "blob",
        }
      );

      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const pdfUrl = window.URL.createObjectURL(pdfBlob);

      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = "summary_report.pdf";
      link.click();

      setSuccess(true);
      setFile(null);
      document.getElementById("file-upload").value = "";
    } catch (error) {
      setError("An error occurred while processing the document");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1 className="header">Legal Document Analysis System</h1>
      <form onSubmit={handleSubmit} className="form">
        {/* Drag and Drop Area */}
        <div
          className={`drag-drop-area ${isDragActive ? "active" : ""}`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <p>Drag and drop your PDF file here</p>
          <p>or</p>
          <label htmlFor="file-upload" className="label file-upload-label">
            Click to select a file
          </label>
          <input
            id="file-upload"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="file-input"
          />
        </div>

        {file && (
          <p className="selected-file">
            Selected file: <strong>{file.name}</strong>
          </p>
        )}

        <button type="submit" disabled={loading} className="submit-button">
          {loading ? "Processing Document..." : "Analyze and Generate Report"}
        </button>
      </form>

      {error && <div className="message error">{error}</div>}
      {success && (
        <div className="message success">
          Analysis complete! Your report has been downloaded.
        </div>
      )}
      <div className="footer">
        <p>
          Upload a legal document in PDF format to generate an analysis report.
        </p>
        <p>
          The system will extract key clauses, identify potential risks, and
          provide a summary.
        </p>
      </div>
    </div>
  );
}

export default UploadPage;
