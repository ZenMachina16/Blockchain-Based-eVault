import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import LawyerRegister from './components/LawyerRegister';
import LawyerDashboard from './components/LawyerDashboard';
import ClientDashboard from './components/ClientDashboard';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path='/' element={<LandingPage />} />
                <Route path='/register' element={<LawyerRegister />} />
                <Route path='/lawyer-dashboard' element={<LawyerDashboard />} />
                <Route path='/client-dashboard' element={<ClientDashboard />} />
            </Routes>
        </Router>
    );
};

export default App;
