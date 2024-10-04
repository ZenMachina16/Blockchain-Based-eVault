// src/index.js or src/index.tsx

import React from 'react';
import ReactDOM from 'react-dom/client'; // Import the createRoot from react-dom/client
import App from './App';
import { AuthProvider } from './context/AuthContext'; // Import your AuthProvider

const root = ReactDOM.createRoot(document.getElementById('root')); // Use createRoot
root.render(
    <React.StrictMode>
        <AuthProvider>
            <App />
        </AuthProvider>
    </React.StrictMode>
);
