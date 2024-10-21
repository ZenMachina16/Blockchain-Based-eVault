import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './components/Homepage';
import FileManagement from './components/FileManagement';
import LawyerDashboard from './components/LawyerDashboard';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/laywer-dashboard" element={<LawyerDashboard />} />
        <Route path="/file-management" element={<FileManagement />} />
      </Routes>
    </Router>
  );
}

export default App;
