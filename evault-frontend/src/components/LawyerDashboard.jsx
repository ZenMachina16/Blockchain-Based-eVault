// // import React, { useState } from "react";
// // import {
// //   Avatar,
// //   TextField,
// //   InputAdornment,
// //   Menu,
// //   MenuItem,
// // } from "@mui/material";
// // import SearchIcon from "@mui/icons-material/Search";
// // import { useNavigate } from "react-router-dom"; // For redirection
// // import "./CSS/LawyerDashboard.css"; // Ensure you have your necessary styles

// // const LawyerDashboard = () => {
// //   const navigate = useNavigate();

// //   // For the dropdown menu
// //   const [anchorEl, setAnchorEl] = useState(null);
// //   const open = Boolean(anchorEl);

// //   const handleAvatarClick = (event) => {
// //     setAnchorEl(event.currentTarget);
// //   };

// //   const handleMenuClose = () => {
// //     setAnchorEl(null);
// //   };

// //   // Logout function used in dropdown
// //   const handleLogout = () => {
// //     localStorage.removeItem("token");
// //     handleMenuClose();
// //     navigate("/login");
// //   };

// //   return (
// //     <div className="dashboard-container">
// //       {/* Left Sidebar */}
// //       <div className="sidebar">
// //         <ul>
// //           <li>My Documents</li>
// //           <li>Summariser</li>
// //           <li>Upload Documents</li>
// //           <li>Case Schedules</li>
// //           <li>Profile</li>
// //           <li>Settings</li>

// //           {/* Optionally, you can remove this Logout button if you want to rely solely on the dropdown */}
// //           <li onClick={handleLogout} style={{ cursor: "pointer" }}>
// //             Logout
// //           </li>
// //         </ul>
// //       </div>

// //       {/* Right Content Area */}
// //       <div className="content-area">
// //         <div className="placeholder-div">
// //           {/* Welcome Message */}
// //           <div id="welcome">
// //             Welcome back,
// //             <br /> Adv. Kapil Dhavale
// //           </div>

// //           {/* Profile & Search Bar Container */}
// //           <div id="header-home-box">
// //             {/* Profile Avatar with Dropdown */}
// //             <div id="profile-logo" style={{ position: "relative" }}>
// //               <Avatar
// //                 alt="Profile"
// //                 src="/profile.jpg" // Replace with actual profile image URL
// //                 sx={{ width: 50, height: 50, cursor: "pointer" }}
// //                 onClick={handleAvatarClick}
// //               />
// //               <Menu
// //                 id="profile-menu"
// //                 anchorEl={anchorEl}
// //                 open={open}
// //                 onClose={handleMenuClose}
// //                 anchorOrigin={{
// //                   vertical: "bottom",
// //                   horizontal: "right",
// //                 }}
// //                 transformOrigin={{
// //                   vertical: "top",
// //                   horizontal: "right",
// //                 }}
// //                 ModalProps={{ disableScrollLock: true }} // Add this line
// //               >
// //                 <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
// //                 <MenuItem onClick={handleMenuClose}>My Account</MenuItem>
// //                 <MenuItem onClick={handleLogout}>Logout</MenuItem>
// //               </Menu>
// //             </div>

// //             {/* Search Bar */}
// //             <div id="search-bar">
// //               <TextField
// //                 id="search-bar-home"
// //                 variant="outlined"
// //                 placeholder="Search..."
// //                 size="small"
// //                 InputProps={{
// //                   startAdornment: (
// //                     <InputAdornment position="start">
// //                       <SearchIcon />
// //                     </InputAdornment>
// //                   ),
// //                 }}
// //                 sx={{
// //                   backgroundColor: "rgb(216, 221, 219)",
// //                   borderRadius: "5px",
// //                   width: "250px",
// //                   height: "36px", // fixed height for uniform look
// //                   boxShadow: "none", // remove any default shadow
// //                   "& .MuiOutlinedInput-notchedOutline": {
// //                     borderColor: "gray",
// //                   },
// //                   "&:hover .MuiOutlinedInput-notchedOutline": {
// //                     borderColor: "gray",
// //                   },
// //                   "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
// //                     borderColor: "gray",
// //                   },
// //                   "& .MuiOutlinedInput-root": {
// //                     boxShadow: "none",
// //                   },
// //                 }}
// //               />
// //             </div>
// //           </div>
// //         </div>

// //         <div id="quick-taskbar">
// //           {/* Box 1: Documents */}
// //           <div className="task-box box-documents">
// //             {/* Add an image at the top */}
// //             <img
// //               src="/docs-uploaded-img.png"
// //               alt="Documents Icon"
// //               className="task-box-icon"
// //             />
// //             <h3>Total 245 Documents</h3>
// //             <p>Uploaded Till Now</p>
// //             <button>Upload Now</button>
// //           </div>

// //           {/* Box 2: Active Cases */}
// //           <div className="task-box box-cases">
// //             <img
// //               src="/active-cases-img.png"
// //               alt="Cases Icon"
// //               className="task-box-icon"
// //             />
// //             <h3>12 Active Cases</h3>
// //             <div className="progress-info">
// //               <div>Ongoing: 50%</div>
// //               <div>Closed: 20%</div>
// //               <div>Pending: 30%</div>
// //             </div>
// //           </div>

// //           {/* Box 3: Deadlines */}
// //           <div className="task-box box-deadlines">
// //             <img
// //               src="/schedule-deadline-img.png"
// //               alt="Deadlines Icon"
// //               className="task-box-icon"
// //             />
// //             <h3>3 Deadlines This Week</h3>
// //             <ul>
// //               <li>Feb 5 2025</li>
// //               <li>Feb 8 2025</li>
// //               <li>Feb 9 2025</li>
// //             </ul>
// //           </div>

// //           {/* Box 4: Taskboard */}
// //           <div className="task-box box-taskboard">
// //             <img
// //               src="/tasks-leaderboard-img.png"
// //               alt="Taskboard Icon"
// //               className="task-box-icon"
// //             />
// //             <h3>Legal Taskboard</h3>
// //             <div id="tasks">
// //               <p>2 Pending</p>
// //               <p>0 Completed</p>
// //             </div>
// //           </div>
// //         </div>
// //         <div id="recent-cases">
// //           <h2>Recent Cases</h2>
// //           <p>Stay updated with your latest cases</p>
// //           <div id="recent-cards">
// //             {/* Case 1 */}
// //             <div className="case-card">
// //               <h3>XYZ Corp vs. John Doe</h3>
// //               <div className="case-details">
// //                 <div className="case-left">
// //                   <p>
// //                     <strong>Client:</strong> John Doe
// //                   </p>
// //                   <p>In Progress</p>
// //                   <button className="view-details">View Details</button>
// //                 </div>
// //                 <div className="case-right">
// //                   <p>
// //                     <strong>Last Updated:</strong> Feb 2, 2025
// //                   </p>
// //                   <p>Court Hearing – Feb 10, 2025</p>
// //                   <button className="add-document">Add Document</button>
// //                 </div>
// //               </div>
// //             </div>

// //             {/* Case 2 */}
// //             <div className="case-card">
// //               <h3>Johnson Estate vs. Green Ltd.</h3>
// //               <div className="case-details">
// //                 <div className="case-left">
// //                   <p>
// //                     <strong>Client:</strong> Johnson Estate
// //                   </p>
// //                   <p>Pending</p>
// //                   <button className="view-details">View Details</button>
// //                 </div>
// //                 <div className="case-right">
// //                   <p>
// //                     <strong>Last Updated:</strong> Jan 30, 2025
// //                   </p>
// //                   <p>Court Hearing – Feb 15, 2025</p>
// //                   <button className="add-document">Add Document</button>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default LawyerDashboard;



// import React, { useState } from "react";
// import {
//   Avatar,
//   TextField,
//   InputAdornment,
//   Menu,
//   MenuItem,
// } from "@mui/material";
// import SearchIcon from "@mui/icons-material/Search";
// import { useNavigate } from "react-router-dom"; // For redirection
// import "./CSS/LawyerDashboard.css"; // Ensure you have your necessary styles

// const LawyerDashboard = () => {
//   const navigate = useNavigate();

//   // For the dropdown menu
//   const [anchorEl, setAnchorEl] = useState(null);
//   const open = Boolean(anchorEl);

//   const handleAvatarClick = (event) => {
//     setAnchorEl(event.currentTarget);
//   };

//   const handleMenuClose = () => {
//     setAnchorEl(null);
//   };

//   // Logout function used in dropdown
//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     handleMenuClose();
//     navigate("/login");
//   };

//   // Navigate to UploadPage
//   const handleSummariserClick = () => {
//     navigate("/UploadPage");
//   };

//   return (
//     <div className="dashboard-container">
//       {/* Left Sidebar */}
//       <div className="sidebar">
//         <ul>
//           <li>My Documents</li>
//           <li onClick={handleSummariserClick} style={{ cursor: "pointer" }}>
//             Summariser
//           </li>
//           <li>Upload Documents</li>
//           <li>Case Schedules</li>
//           <li>Profile</li>
//           <li>Settings</li>

//           {/* Optionally, you can remove this Logout button if you want to rely solely on the dropdown */}
//           <li onClick={handleLogout} style={{ cursor: "pointer" }}>
//             Logout
//           </li>
//         </ul>
//       </div>

//       {/* Right Content Area */}
//       <div className="content-area">
//         <div className="placeholder-div">
//           {/* Welcome Message */}
//           <div id="welcome">
//             Welcome back,
//             <br /> Adv. Kapil Dhavale
//           </div>

//           {/* Profile & Search Bar Container */}
//           <div id="header-home-box">
//             {/* Profile Avatar with Dropdown */}
//             <div id="profile-logo" style={{ position: "relative" }}>
//               <Avatar
//                 alt="Profile"
//                 src="/profile.jpg" // Replace with actual profile image URL
//                 sx={{ width: 50, height: 50, cursor: "pointer" }}
//                 onClick={handleAvatarClick}
//               />
//               <Menu
//                 id="profile-menu"
//                 anchorEl={anchorEl}
//                 open={open}
//                 onClose={handleMenuClose}
//                 anchorOrigin={{
//                   vertical: "bottom",
//                   horizontal: "right",
//                 }}
//                 transformOrigin={{
//                   vertical: "top",
//                   horizontal: "right",
//                 }}
//                 ModalProps={{ disableScrollLock: true }} // Add this line
//               >
//                 <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
//                 <MenuItem onClick={handleMenuClose}>My Account</MenuItem>
//                 <MenuItem onClick={handleLogout}>Logout</MenuItem>
//               </Menu>
//             </div>

//             {/* Search Bar */}
//             <div id="search-bar">
//               <TextField
//                 id="search-bar-home"
//                 variant="outlined"
//                 placeholder="Search..."
//                 size="small"
//                 InputProps={{
//                   startAdornment: (
//                     <InputAdornment position="start">
//                       <SearchIcon />
//                     </InputAdornment>
//                   ),
//                 }}
//                 sx={{
//                   backgroundColor: "rgb(216, 221, 219)",
//                   borderRadius: "5px",
//                   width: "250px",
//                   height: "36px", // fixed height for uniform look
//                   boxShadow: "none", // remove any default shadow
//                   "& .MuiOutlinedInput-notchedOutline": {
//                     borderColor: "gray",
//                   },
//                   "&:hover .MuiOutlinedInput-notchedOutline": {
//                     borderColor: "gray",
//                   },
//                   "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
//                     borderColor: "gray",
//                   },
//                   "& .MuiOutlinedInput-root": {
//                     boxShadow: "none",
//                   },
//                 }}
//               />
//             </div>
//           </div>
//         </div>

//         <div id="quick-taskbar">
//           {/* Box 1: Documents */}
//           <div className="task-box box-documents">
//             {/* Add an image at the top */}
//             <img
//               src="/docs-uploaded-img.png"
//               alt="Documents Icon"
//               className="task-box-icon"
//             />
//             <h3>Total 245 Documents</h3>
//             <p>Uploaded Till Now</p>
//             <button>Upload Now</button>
//           </div>

//           {/* Box 2: Active Cases */}
//           <div className="task-box box-cases">
//             <img
//               src="/active-cases-img.png"
//               alt="Cases Icon"
//               className="task-box-icon"
//             />
//             <h3>12 Active Cases</h3>
//             <div className="progress-info">
//               <div>Ongoing: 50%</div>
//               <div>Closed: 20%</div>
//               <div>Pending: 30%</div>
//             </div>
//           </div>

//           {/* Box 3: Deadlines */}
//           <div className="task-box box-deadlines">
//             <img
//               src="/schedule-deadline-img.png"
//               alt="Deadlines Icon"
//               className="task-box-icon"
//             />
//             <h3>3 Deadlines This Week</h3>
//             <ul>
//               <li>Feb 5 2025</li>
//               <li>Feb 8 2025</li>
//               <li>Feb 9 2025</li>
//             </ul>
//           </div>

//           {/* Box 4: Taskboard */}
//           <div className="task-box box-taskboard">
//             <img
//               src="/tasks-leaderboard-img.png"
//               alt="Taskboard Icon"
//               className="task-box-icon"
//             />
//             <h3>Legal Taskboard</h3>
//             <div id="tasks">
//               <p>2 Pending</p>
//               <p>0 Completed</p>
//             </div>
//           </div>
//         </div>
//         <div id="recent-cases">
//           <h2>Recent Cases</h2>
//           <p>Stay updated with your latest cases</p>
//           <div id="recent-cards">
//             {/* Case 1 */}
//             <div className="case-card">
//               <h3>XYZ Corp vs. John Doe</h3>
//               <div className="case-details">
//                 <div className="case-left">
//                   <p>
//                     <strong>Client:</strong> John Doe
//                   </p>
//                   <p>In Progress</p>
//                   <button className="view-details">View Details</button>
//                 </div>
//                 <div className="case-right">
//                   <p>
//                     <strong>Last Updated:</strong> Feb 2, 2025
//                   </p>
//                   <p>Court Hearing – Feb 10, 2025</p>
//                   <button className="add-document">Add Document</button>
//                 </div>
//               </div>
//             </div>

//             {/* Case 2 */}
//             <div className="case-card">
//               <h3>Johnson Estate vs. Green Ltd.</h3>
//               <div className="case-details">
//                 <div className="case-left">
//                   <p>
//                     <strong>Client:</strong> Johnson Estate
//                   </p>
//                   <p>Pending</p>
//                   <button className="view-details">View Details</button>
//                 </div>
//                 <div className="case-right">
//                   <p>
//                     <strong>Last Updated:</strong> Jan 30, 2025
//                   </p>
//                   <p>Court Hearing – Feb 15, 2025</p>
//                   <button className="add-document">Add Document</button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LawyerDashboard;

import React, { useState } from "react";
import {
  Avatar,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom"; // For redirection
import "./CSS/LawyerDashboard.css"; // Ensure you have your necessary styles

const LawyerDashboard = () => {
  const navigate = useNavigate();

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
            <h3>12 Active Cases</h3>
            <div className="progress-info">
              <div>Ongoing: 50%</div>
              <div>Closed: 20%</div>
              <div>Pending: 30%</div>
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
          <div id="recent-cards">
            {/* Case 1 */}
            <div className="case-card">
              <h3>XYZ Corp vs. John Doe</h3>
              <div className="case-details">
                <div className="case-left">
                  <p>
                    <strong>Client:</strong> John Doe
                  </p>
                  <p>In Progress</p>
                  <button className="view-details">View Details</button>
                </div>
                <div className="case-right">
                  <p>
                    <strong>Last Updated:</strong> Feb 2, 2025
                  </p>
                  <p>Court Hearing – Feb 10, 2025</p>
                  <button className="add-document">Add Document</button>
                </div>
              </div>
            </div>

            {/* Case 2 */}
            <div className="case-card">
              <h3>Johnson Estate vs. Green Ltd.</h3>
              <div className="case-details">
                <div className="case-left">
                  <p>
                    <strong>Client:</strong> Johnson Estate
                  </p>
                  <p>Pending</p>
                  <button className="view-details">View Details</button>
                </div>
                <div className="case-right">
                  <p>
                    <strong>Last Updated:</strong> Jan 30, 2025
                  </p>
                  <p>Court Hearing – Feb 15, 2025</p>
                  <button className="add-document">Add Document</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LawyerDashboard;
