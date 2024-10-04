// src/App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Importing React Router components
import LawyerRegister from './components/LawyerRegister'; // Importing components
import ClientLinking from './components/ClientLinking';
import DocumentUpload from './components/DocumentUpload';
import DocumentList from './components/DocumentList';
import LawyerDashboard from './components/LawyerDashboard';
import ClientDashboard from './components/ClientDashboard';
import LandingPage from './components/LandingPage'; // Landing page component
import './App.css'; // Importing CSS for the app

function App() {
    return (
        <Router> {/* Setting up the Router for navigation */}
            <div className="App"> {/* Main application container */}
                <Routes> {/* Wrapping routes in the Routes component */}
                    <Route path="/" element={<LandingPage />} /> {/* Default landing page */}
                    <Route path="/lawyer-register" element={<LawyerRegister />} /> {/* Route for lawyer registration */}
                    <Route path="/client-linking" element={<ClientLinking />} /> {/* Route for linking clients */}
                    <Route path="/document-upload" element={<DocumentUpload />} /> {/* Route for uploading documents */}
                    <Route path="/document-list" element={<DocumentList />} /> {/* Route for listing documents */}
                    <Route path="/lawyer-dashboard" element={<LawyerDashboard />} /> {/* Route for lawyer dashboard */}
                    <Route path="/client-dashboard" element={<ClientDashboard />} /> {/* Route for client dashboard */}
                </Routes>
            </div>
        </Router>
    );
}

export default App; // Exporting the App component
