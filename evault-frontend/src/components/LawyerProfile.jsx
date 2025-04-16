import React, { useState, useEffect } from "react";
import axios from "axios";
import { ethers } from "ethers";
import { useLocation, useNavigate } from "react-router-dom";
import contractABI from "../contractABI";
import "./CSS/LawyerProfile.css";

const LawyerProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

  // Preset default values for professional info.
  const [profile, setProfile] = useState({
    name: "",
    lawyerId: "",
    barRegistrationNo: "BR9140",
    yearsOfExperience: "10",
    bio: "",
    email: "",
    location: "Mumbai, Maharashtra",
    profilePicture: "",
  });
  const [documents, setDocuments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Toggle edit mode (without changing layout)
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/lawyer/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Update profile with fetched values (or keep defaults if not provided)
      setProfile(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load profile");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put("http://localhost:5000/api/lawyer/profile", profile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Profile updated successfully");
      setError("");
      setIsEditing(false);
      setTimeout(() => navigate("/lawyer-dashboard"), 2000);
    } catch (err) {
      setError("Failed to update profile");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size should be less than 5MB");
        return;
      }
      const formData = new FormData();
      formData.append("profilePicture", file);
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
          "http://localhost:5000/api/lawyer/profile/picture",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        const profilePicture = `http://localhost:5000${response.data.profilePicture}`;
        setProfile((prev) => ({ ...prev, profilePicture }));
        setSuccess("Profile picture updated successfully");
      } catch (err) {
        setError(
          "Failed to upload profile picture. " +
            (err.response?.data?.message || err.message || "Unknown error occurred")
        );
      } finally {
        setLoading(false);
      }
    }
  };

  // Fetch blockchain documents (unchanged)
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      const documentHashes = await contract.getAllDocumentHashes();
      const docs = await Promise.all(
        documentHashes.map(async (hash) => {
          const metadata = await contract.getDocumentMetadata(hash);
          return {
            ipfsHash: hash,
            title: metadata.title,
            description: metadata.description,
            type: metadata.type,
            date: metadata.date,
            isVerified: true,
          };
        })
      );
      setDocuments(docs);
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to fetch documents from blockchain");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  const renderMessage = () => {
    if (error) {
      return <div className="alert error-alert">{error}</div>;
    }
    if (success) {
      return <div className="alert success-alert">{success}</div>;
    }
    return null;
  };

  // Render the fields inline so the layout remains the same.
  const renderPersonalInfo = () => (
    <div className="profile-top-section">
      <p>
        <strong>Lawyer ID: </strong>
        {isEditing ? (
          <input
            type="text"
            name="lawyerId"
            value={profile.lawyerId}
            onChange={handleChange}
          />
        ) : (
          profile.lawyerId || "N/A"
        )}
      </p>
      <p>
        <strong>Email: </strong>
        {profile.email || "N/A"}
      </p>
      <p>
        <strong>Bio / About Me: </strong>
        {isEditing ? (
          <textarea
            name="bio"
            rows="4"
            value={profile.bio}
            onChange={handleChange}
          />
        ) : (
          profile.bio || "N/A"
        )}
      </p>
    </div>
  );

  const renderProfessionalInfo = () => (
    <div className="profile-info-section">
      <h2>Professional Information</h2>
      <p>
        <strong>Bar Registration No: </strong>
        {isEditing ? (
          <input
            type="text"
            name="barRegistrationNo"
            value={profile.barRegistrationNo}
            onChange={handleChange}
          />
        ) : (
          profile.barRegistrationNo || "N/A"
        )}
      </p>
      <p>
        <strong>Years of Experience: </strong>
        {isEditing ? (
          <input
            type="number"
            name="yearsOfExperience"
            value={profile.yearsOfExperience}
            onChange={handleChange}
          />
        ) : (
          profile.yearsOfExperience || "N/A"
        )}
      </p>
      <p>
        <strong>Location: </strong>
        {isEditing ? (
          <input
            type="text"
            name="location"
            value={profile.location}
            onChange={handleChange}
          />
        ) : (
          profile.location || "N/A"
        )}
      </p>
    </div>
  );

  return (
    <div className="profile-container">
      {/* Avatar & Name Section */}
      <div className="profile-avatar-section">
        <div className="avatar-wrapper">
          {profile.profilePicture ? (
            <img className="avatar-img" src={profile.profilePicture} alt="Profile" />
          ) : (
            <div className="avatar-initials">
              {profile.name ? profile.name.charAt(0).toUpperCase() : "?"}
            </div>
          )}
          {isEditing && (
            <div className="avatar-upload">
              <label htmlFor="file-input">&#128247;</label>
              <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />
            </div>
          )}
        </div>
        <div className="profile-title">
          <h1>Adv. {profile.name || "Lawyer"}</h1>
          {isEditing ? (
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              placeholder="Enter your name"
            />
          ) : null}
        </div>
      </div>

      {renderMessage()}

      {/* Profile Details Section */}
      <div className="profile-details-section">
        {renderPersonalInfo()}
        {renderProfessionalInfo()}

        {/* Toggle/Action Buttons */}
        <div className="update-btn-container">
          {isEditing ? (
            <>
              <button className="secondary-btn" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
              <button className="primary-btn" onClick={handleSubmit}>
                Save Changes
              </button>
            </>
          ) : (
            <>
              <button className="primary-btn" onClick={() => setIsEditing(true)}>
                Edit Profile
              </button>
              <button className="secondary-btn" onClick={() => navigate("/lawyer-dashboard")}>
                Back to Dashboard
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LawyerProfile;
