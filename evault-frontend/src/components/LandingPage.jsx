// src/components/LandingPage.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import the useAuth hook

const LandingPage = () => {
    const [role, setRole] = useState(''); // Holds the selected role
    const { login } = useAuth(); // Get the login function from context

    const handleRoleSelection = (selectedRole) => {
        setRole(selectedRole);
        // Simulate a user login, replace with actual authentication
        login({ name: 'User' }, selectedRole);
    };

    return (
        <div>
            <h1>Welcome to eVault</h1>
            {!role ? (
                <div>
                    <h2>Select Your Role</h2>
                    <button onClick={() => handleRoleSelection('lawyer')}>I am a Lawyer</button>
                    <button onClick={() => handleRoleSelection('client')}>I am a Client</button>
                </div>
            ) : (
                <div>
                    <h2>You are logged in as a {role}</h2>
                    <Link to="/document-upload">Upload Document</Link>
                    <Link to="/document-list">View Documents</Link>
                    {/* Additional links based on role can be added here */}
                </div>
            )}
        </div>
    );
};

export default LandingPage;
