import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import LawyerProfile from "./components/LawyerProfile";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />{" "}
          {/* Added register route */}
          <Route path="/lawyer-dashboard" element={<LawyerDashboard />} />
          <Route path="/client-dashboard" element={<ClientDashboard />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/files" element={<FileManagement />} />
          <Route path="/fetch-file" element={<FetchFileComponent />} />
          <Route path="/create-case" element={<CaseForm />} />
          <Route path="/case/:id" element={<CaseDetails />} />
          <Route path="/edit-case/:caseId" element={<EditCaseForm />} />
          <Route path="/lawyer-profile" element={<LawyerProfile />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
