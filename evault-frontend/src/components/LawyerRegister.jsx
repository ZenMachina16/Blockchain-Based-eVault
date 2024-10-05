import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LawyerRegister = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const navigate = useNavigate(); // Hook for navigation

    const handleRegister = () => {
        // Implement registration logic (e.g., sending data to the backend)
        console.log(`Registering lawyer: ${name}, Email: ${email}`);
        
        // Assuming registration is successful, navigate to Lawyer Dashboard
        navigate('/lawyer-dashboard');
    };

    return (
        <div>
            <h2>Lawyer Registration</h2>
            <input 
                type="text" 
                placeholder="Name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
            />
            <input 
                type="email" 
                placeholder="Email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
            />
            <button onClick={handleRegister}>Register</button>
        </div>
    );
};

export default LawyerRegister;
