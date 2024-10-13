import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom"; // Importing Router and Route
import UploadDocCourtOfficial from "./components/UploadDocCourtOfficial"; // Import the new UploadDocCourtOfficial component

function App() {
  return (
    <Router>
      <div>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/upload">Upload Document</Link>
        </nav>
        <Routes>
          <Route path="/upload" element={<UploadDocCourtOfficial />} /> {/* Route for UploadDocCourtOfficial */}
          <Route path="/" element={<h1>Welcome to the NavinEvault</h1>} /> {/* Home page */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
