import React, { useState, useEffect } from "react";
import {
  Avatar,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom"; // For redirection
import axios from "axios";
import "./CSS/LawyerDashboard.css"; // Ensure you have your necessary styles

const LawyerDashboard = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // For the dropdown menu
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Logout function used in dropdown
  const handleLogout = () => {
    localStorage.removeItem("token");
    handleMenuClose();
    navigate("/login");
  };

  // Navigate to Summariser page
  const handleSummariserClick = () => {
    navigate("/UploadPage");
  };

  // Navigate to Create Case page
  const handleCreateCaseClick = () => {
    navigate("/cases/create");
  };

  // Fetch cases for the lawyer
  useEffect(() => {
    const fetchCases = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication required");
          setLoading(false);
          navigate("/login");
          return;
        }

        const response = await axios.get(
          "http://localhost:5000/api/cases/lawyer",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setCases(response.data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        if (err.response) {
          setError(err.response.data.message || "Failed to load cases");
        } else {
          setError("Network error. Please try again.");
        }
      }
    };

    fetchCases();
  }, [navigate]);

  // Handle case click to view details
  const handleCaseClick = (caseId) => {
    navigate(`/case-details/${caseId}`);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="dashboard-container">
      {/* Left Sidebar */}
      <div className="sidebar">
        <ul>
          <li>My Documents</li>
          <li onClick={handleSummariserClick} style={{ cursor: "pointer" }}>
            Summariser
          </li>
          <li
            onClick={() => navigate("/file-management")}
            style={{ cursor: "pointer" }}
          >
            Upload Documents
          </li>
          <li onClick={handleCreateCaseClick} style={{ cursor: "pointer" }}>
            Create Case
          </li>
          <li>Profile</li>
          <li>Settings</li>
          <li onClick={handleLogout} style={{ cursor: "pointer" }}>
            Logout
          </li>
        </ul>
      </div>

      {/* Right Content Area */}
      <div className="content-area">
        <div className="placeholder-div">
          {/* Welcome Message */}
          <div id="welcome">
            Welcome back,
            <br /> Adv. Kapil Dhavale
          </div>

          {/* Profile & Search Bar Container */}
          <div id="header-home-box">
            {/* Profile Avatar with Dropdown */}
            <div id="profile-logo" style={{ position: "relative" }}>
              <Avatar
                alt="Profile"
                src="/profile.jpg" // Replace with actual profile image URL
                sx={{ width: 50, height: 50, cursor: "pointer" }}
                onClick={handleAvatarClick}
              />
              <Menu
                id="profile-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                ModalProps={{ disableScrollLock: true }}
              >
                <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
                <MenuItem onClick={handleMenuClose}>My Account</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </div>

            {/* Search Bar */}
            <div id="search-bar">
              <TextField
                id="search-bar-home"
                variant="outlined"
                placeholder="Search..."
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  backgroundColor: "rgb(216, 221, 219)",
                  borderRadius: "5px",
                  width: "250px",
                  height: "36px",
                  boxShadow: "none",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "gray",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "gray",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "gray",
                  },
                  "& .MuiOutlinedInput-root": {
                    boxShadow: "none",
                  },
                }}
              />
            </div>
          </div>
        </div>

        <div id="quick-taskbar">
          {/* Box 1: Documents */}
          <div className="task-box box-documents">
            <img
              src="/docs-uploaded-img.png"
              alt="Documents Icon"
              className="task-box-icon"
            />
            <h3>Total 245 Documents</h3>
            <p>Uploaded Till Now</p>
            <button onClick={() => navigate("/file-management")}>
              Upload Now
            </button>
          </div>

          {/* Box 2: Active Cases */}
          <div className="task-box box-cases">
            <img
              src="/active-cases-img.png"
              alt="Cases Icon"
              className="task-box-icon"
            />
            <h3>{cases.length} Active Cases</h3>
            <div className="progress-info">
              <div>
                Ongoing:{" "}
                {cases.filter((c) => c.status === "In Progress").length}
              </div>
              <div>
                Closed: {cases.filter((c) => c.status === "Closed").length}
              </div>
              <div>
                Pending: {cases.filter((c) => c.status === "Open").length}
              </div>
            </div>
          </div>

          {/* Box 3: Deadlines */}
          <div className="task-box box-deadlines">
            <img
              src="/schedule-deadline-img.png"
              alt="Deadlines Icon"
              className="task-box-icon"
            />
            <h3>3 Deadlines This Week</h3>
            <ul>
              <li>Feb 5 2025</li>
              <li>Feb 8 2025</li>
              <li>Feb 9 2025</li>
            </ul>
          </div>

          {/* Box 4: Taskboard */}
          <div className="task-box box-taskboard">
            <img
              src="/tasks-leaderboard-img.png"
              alt="Taskboard Icon"
              className="task-box-icon"
            />
            <h3>Legal Taskboard</h3>
            <div id="tasks">
              <p>2 Pending</p>
              <p>0 Completed</p>
            </div>
          </div>
        </div>
        <div id="recent-cases">
          <h2>Recent Cases</h2>
          <p>Stay updated with your latest cases</p>
          {loading ? (
            <div className="loading">Loading cases...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : cases.length === 0 ? (
            <div className="no-cases">No cases found. Create a new case to get started.</div>
          ) : (
            <div id="recent-cards">
              {cases.map((caseItem) => (
                <div 
                  key={caseItem._id} 
                  className="case-card"
                  onClick={() => handleCaseClick(caseItem._id)}
                  style={{ cursor: "pointer" }}
                >
                  <h3>{caseItem.caseTitle}</h3>
                  <div className="case-details">
                    <div className="case-left">
                      <p>
                        <strong>Client:</strong> {caseItem.clientName}
                      </p>
                      <p className={`status-badge ${caseItem.status.toLowerCase()}`}>
                        {caseItem.status}
                      </p>
                      <button className="view-details">View Details</button>
                    </div>
                    <div className="case-right">
                      <p>
                        <strong>Last Updated:</strong>{" "}
                        {formatDate(caseItem.updatedAt)}
                      </p>
                      <p>Case Type: {caseItem.caseType}</p>
                      <button className="add-document">Add Document</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LawyerDashboard;
