import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import './CSS/Homepage.css'; // Import the CSS file

const Homepage = () => {
    const navigate = useNavigate(); // Initialize the navigate function

    const handleButtonClick = () => {
        navigate('/laywer-dashboard'); // Navigate to the File Management page
    };

    return (
        <div className="container">
            <img 
                src="/law-bg.jpg" 
                alt="homepage-law" 
                className="image" 
            />
            <div className="darkcover"> {/* Dark overlay */}
                <div className="title">BLOCKCHAIN BASED e-VAULT</div>
                <button onClick={handleButtonClick} className="button"> {/* Button for navigation */}
                    GET STARTED
                </button>
            </div>
        </div>
    );
};

export default Homepage;
