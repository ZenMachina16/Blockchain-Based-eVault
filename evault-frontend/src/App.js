import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./components/Homepage";
import Login from "./components/Login";
import Register from "./components/Register"; // Import the Register component
import LawyerDashboard from "./components/LawyerDashboard";
import FileManagement from "./components/FileManagement";
import FetchFileComponent from "./components/FetchFileComponent";
import UploadPage from "./components/UploadPage";
import { AuthProvider } from "./context/AuthContext";
import ClientDashboard from "./components/ClientDashboard";
import CaseForm from "./components/CaseManagementForm";
import CaseDetails from "./components/CaseDetails";
import EditCaseForm from "./components/EditCaseForm";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />{" "}
          {/* Added register route */}
          <Route path="/lawyer-dashboard" element={<LawyerDashboard />} />
          <Route path="/client-dashboard" element={<ClientDashboard />} />
          <Route path="/UploadPage" element={<UploadPage />} />
          <Route path="/file-management" element={<FileManagement />} />
          <Route path="/fetch-file" element={<FetchFileComponent />} />
          <Route path="/cases/create" element={<CaseForm />} />
          <Route path="/case-details/:caseId" element={<CaseDetails />} />
          <Route path="/edit-case/:caseId" element={<EditCaseForm />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
