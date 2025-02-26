

// import React, { useState } from "react";
// import axios from "axios";

// function UploadPage() {
//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // Handle file selection
//   const handleFileChange = (e) => {
//     setFile(e.target.files[0]);
//     setError(null);
//   };

//   // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!file) {
//       setError("Please select a file");
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       // Send the file to the backend
//       const response = await axios.post(
//         "http://localhost:5001/upload",
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//           responseType: "blob", // Expecting binary data (PDF)
//         }
//       );

//       // Create a URL for the generated PDF
//       const pdfBlob = new Blob([response.data], { type: "application/pdf" });
//       const pdfUrl = window.URL.createObjectURL(pdfBlob);

//       // Create a link to download the PDF
//       const link = document.createElement("a");
//       link.href = pdfUrl;
//       link.download = "summary_report.pdf";
//       link.click();
//     } catch (error) {
//       setError("An error occurred while processing the document");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <h1>Upload PDF for Summary and Download Report</h1>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="file"
//           accept="application/pdf"
//           onChange={handleFileChange}
//         />
//         <button type="submit" disabled={loading}>
//           {loading ? "Processing..." : "Upload and Generate Report"}
//         </button>
//       </form>

//       {error && <p style={{ color: "red" }}>{error}</p>}
//     </div>
//   );
// }

// export default UploadPage;


import React, { useState } from "react";
import axios from "axios";

function UploadPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
    setSuccess(false);
  };

  // Handle form submission
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
      // Send the file to the backend
      const response = await axios.post(
        "http://localhost:5001/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          responseType: "blob", // Expecting binary data (PDF)
        }
      );

      // Create a URL for the generated PDF
      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const pdfUrl = window.URL.createObjectURL(pdfBlob);

      // Create a link to download the PDF
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = "summary_report.pdf";
      link.click();

      setSuccess(true);
      setFile(null);
      // Reset the file input
      document.getElementById("file-upload").value = "";
    } catch (error) {
      setError("An error occurred while processing the document");
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    maxWidth: "800px",
    margin: "0 auto",
    minHeight: "80vh",
    fontFamily: "'Arial', sans-serif",
  };

  const headerStyle = {
    color: "#2c3e50",
    marginBottom: "2rem",
    textAlign: "center",
    borderBottom: "2px solid #3498db",
    paddingBottom: "1rem",
    width: "100%",
  };

  const formStyle = {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    padding: "2rem",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  };

  const fileInputContainerStyle = {
    display: "flex",
    flexDirection: "column",
    marginBottom: "2rem",
  };

  const labelStyle = {
    marginBottom: "0.5rem",
    fontWeight: "600",
    color: "#2c3e50",
  };

  const fileInputStyle = {
    border: "1px solid #ced4da",
    padding: "0.75rem",
    borderRadius: "4px",
    backgroundColor: "white",
    cursor: "pointer",
  };

  const buttonStyle = {
    backgroundColor: loading ? "#94a3b8" : "#3498db",
    color: "white",
    border: "none",
    padding: "1rem",
    borderRadius: "4px",
    cursor: loading ? "not-allowed" : "pointer",
    fontWeight: "bold",
    fontSize: "1rem",
    transition: "background-color 0.3s",
  };

  const errorStyle = {
    color: "#e74c3c",
    marginTop: "1rem",
    padding: "0.75rem",
    backgroundColor: "#fde8e8",
    borderRadius: "4px",
    width: "100%",
    textAlign: "center",
  };

  const successStyle = {
    color: "#27ae60",
    marginTop: "1rem",
    padding: "0.75rem",
    backgroundColor: "#e6ffef",
    borderRadius: "4px",
    width: "100%",
    textAlign: "center",
  };

  const footerStyle = {
    marginTop: "2rem",
    textAlign: "center",
    color: "#7f8c8d",
    fontSize: "0.9rem",
  };

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>Legal Document Analysis System</h1>

      <form onSubmit={handleSubmit} style={formStyle}>
        <div style={fileInputContainerStyle}>
          <label htmlFor="file-upload" style={labelStyle}>
            Upload PDF Document:
          </label>
          <input
            id="file-upload"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            style={fileInputStyle}
          />
          {file && (
            <p style={{ marginTop: "0.5rem", color: "#2c3e50" }}>
              Selected file: <strong>{file.name}</strong>
            </p>
          )}
        </div>

        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? "Processing Document..." : "Analyze and Generate Report"}
        </button>
      </form>

      {error && <div style={errorStyle}>{error}</div>}
      {success && (
        <div style={successStyle}>
          Analysis complete! Your report has been downloaded.
        </div>
      )}

      <div style={footerStyle}>
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