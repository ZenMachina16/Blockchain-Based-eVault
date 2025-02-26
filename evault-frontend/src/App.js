import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./components/Homepage";
import Login from "./components/Login";
import Register from "./components/Register"; // Import the Register component
import LawyerDashboard from "./components/LawyerDashboard";
import FileManagement from "./components/FileManagement";
import FetchFileComponent from "./components/FetchFileComponent";
import UploadPage from "./components/UploadPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />{" "}
        {/* Added register route */}
        <Route path="/lawyer-dashboard" element={<LawyerDashboard />} />
        <Route path="/UploadPage" element={<UploadPage />} />
        <Route path="/file-management" element={<FileManagement />} />
        <Route path="/fetch-file" element={<FetchFileComponent />} />
      </Routes>
    </Router>
  );
}

export default App;
