import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './components/Homepage';
import FileManagement from './components/FileManagement';
import LawyerDashboard from './components/LawyerDashboard';
import FetchFileComponent from './components/FetchFileComponent';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/laywer-dashboard" element={<LawyerDashboard />} />
        <Route path="/file-management" element={<FileManagement />} />
        <Route path="/fetch-file" element={<FetchFileComponent />} />

      </Routes>
    </Router>
  );
}

export default App;
