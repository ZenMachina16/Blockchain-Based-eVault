import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div>
            <h1>Welcome to the eVault System</h1>
            <p>Securely manage legal documents and case files.</p>
            <Link to="/register">Register as Lawyer</Link>
        </div>
    );
};

export default LandingPage;
