import React, { useState } from "react";
import axios from "axios";
import "./CSS/FileManagement.css"; // Import the updated CSS file

const FileManagement = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [dateOfJudgment, setDateOfJudgment] = useState("");
  const [caseNumber, setCaseNumber] = useState("");
  const [category, setCategory] = useState("");
  const [judgeName, setJudgeName] = useState("");
  const [linkedClients, setLinkedClients] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("dateOfJudgment", dateOfJudgment);
    formData.append("caseNumber", caseNumber);
    formData.append("category", category);
    formData.append("judgeName", judgeName);
    formData.append("linkedClients", JSON.stringify(linkedClients));

    // Retrieve token from localStorage (or sessionStorage)
    const token = localStorage.getItem("token");

    try {
      const response = await axios.post("http://localhost:5000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`,
        },
      });
      console.log(response.data);
      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert(`Error uploading file: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleLinkedClientsChange = (e) => {
    const input = e.target.value;
    const clientsArray = input.split(",").map((client) => client.trim());
    setLinkedClients(clientsArray);
  };

  return (
    <div className="file-upload-management">
      <div className="file-upload-darkcover"></div>
      <div className="file-upload-head">CASE FILE UPLOAD</div>
      <div className="file-upload-mukhya">Case Information</div>
      <form className="file-upload-form" onSubmit={handleUpload}>
        <div className="file-upload-input-group">
          <label htmlFor="caseTitle">Case Title:</label>
          <input
            type="text"
            id="caseTitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="file-upload-input-group">
          <label htmlFor="caseType">Case Type:</label>
          <input
            type="text"
            id="caseType"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
        </div>
        <div className="file-upload-input-group">
          <label htmlFor="judgeName">Judge Name:</label>
          <input
            type="text"
            id="judgeName"
            value={judgeName}
            onChange={(e) => setJudgeName(e.target.value)}
            required
          />
        </div>
        <div className="file-upload-input-group">
          <label htmlFor="caseNumber">Case Number:</label>
          <input
            type="text"
            id="caseNumber"
            value={caseNumber}
            onChange={(e) => setCaseNumber(e.target.value)}
            required
          />
        </div>
        <div className="file-upload-input-group">
          <label htmlFor="dateOfJudgment">Date of Judgment:</label>
          <input
            type="date"
            id="dateOfJudgment"
            value={dateOfJudgment}
            onChange={(e) => setDateOfJudgment(e.target.value)}
            required
          />
        </div>
        <div className="file-upload-input-group">
          <label htmlFor="linkedClients">Linked Clients:</label>
          <input
            type="text"
            id="linkedClients"
            onChange={handleLinkedClientsChange}
            placeholder="Comma-separated client IDs"
          />
        </div>
        <div className="file-upload-input-group">
          <label htmlFor="fileUpload">Upload File:</label>
          <input
            type="file"
            id="fileUpload"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileChange}
            required
          />
        </div>
        <div className="file-upload-button-container">
          <button type="submit" className="file-upload-button">Upload</button>
        </div>
      </form>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
};

export default FileManagement;