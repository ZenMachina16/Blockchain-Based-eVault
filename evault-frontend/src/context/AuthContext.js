// src/AuthContext.js

import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Holds the authenticated user
    const [role, setRole] = useState(null); // Holds the user role (lawyer or client)

    const login = (userData, userRole) => {
        setUser(userData);
        setRole(userRole);
    };

    const logout = () => {
        setUser(null);
        setRole(null);
    };

    return (
        <AuthContext.Provider value={{ user, role, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
