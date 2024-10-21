import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import './CSS/LawyerDashboard.css'; // Import the CSS file

const LawyeDashboard = () => {
    const navigate = useNavigate(); // Initialize the navigate function

    const handleButtonClick = () => {
        navigate('/file-management'); // Navigate to the File Management page

       
    };

    const handleFindCaseClick = () => {
        navigate('/fetch-file');
    };

    return (
        <div className="container">
            <img 
                src="/register-bg.jpg" 
                alt="register-law" 
                className="image" 
            />
            <div className="darkcover"> {/* Dark overlay */}
                <div className="box">
                    <div className="header">YOU ARE A REGISTERED LAWYER</div>
                    <div className="logo">
                        <img 
                            src="/Lawyer.png" 
                            alt="lawyer-logo" 
                            className="logo-image" 
                        />
                    </div>
                    <div className="dets">
                        Adv. Aniket Deshmukh<br></br>
                        aniket.deshmukh@example.com<br></br>
                        Registration No.: MAH/12345/2024
                    </div>
                    <div id="speciality">Civil Law & Property Disputes</div>
                    <div className="registerandfetchbuttons">
                    <button onClick={handleButtonClick} className="registercase"> {/* Button for navigation */}
                    Register a New Case
                </button>
                <button onClick={handleFindCaseClick} className="fetchcase"> {/* Button for navigation */}
                    Find a Case
                </button>
                    </div>
                    
                </div>
            </div>
        </div>
    );
};

export default LawyeDashboard;
