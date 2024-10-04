// src/components/ClientDashboard.jsx

import React from 'react';
import DocumentList from './DocumentList';

const ClientDashboard = () => {
    return (
        <div>
            <h2>Client Dashboard</h2>
            <DocumentList />
            {/* You can add more features specific to clients here */}
        </div>
    );
};

export default ClientDashboard;
