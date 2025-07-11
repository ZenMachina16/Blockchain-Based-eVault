import React from "react";
import { useNavigate } from "react-router-dom";
import "./CSS/Homepage.css"; // Import the main CSS file
import "./CSS/LawyerRegistration.css"; // Import the lawyer registration CSS file

const Homepage = () => {
  const navigate = useNavigate(); // Initialize the navigate function

  const handleButtonClick = () => {
    // Navigate to the Login page instead of directly to the dashboard
    navigate("/login");
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="container">
        <img src="/law-bg.jpg" alt="homepage-law" className="image" />
        <div className="darkcover">
          <div className="title">BLOCKCHAIN BASED e-VAULT</div>
          <button
            id="startButton"
            onClick={handleButtonClick}
            className="button"
          >
            <span>GET STARTED</span>
          </button>
          <div className="additional-links">
            <button 
              onClick={() => navigate("/lawyer-registration")} 
              className="secondary-button"
            >
              Apply as Lawyer
            </button>
            <button 
              onClick={() => navigate("/admin-dashboard")} 
              className="secondary-button"
            >
              Admin Portal
            </button>
          </div>
        </div>
      </div>

      {/* About Section */}
      <section id="about">
        <div id="about-head">ABOUT</div>
        <div id="about-para">
          Powered by Ethereum blockchain, our platform offers a secure,
          immutable, and transparent solution for storing and managing legal
          documents. Whether you're a lawyer safeguarding your client's files or
          a client ensuring the protection of your legal records, this platform
          provides the perfect blend of security and ease of access.
        </div>
      </section>

      {/* Updated Features Section */}
      <section id="features">
        <div id="feature-head">FEATURES</div>
        <div className="feature-grid">
          <div className="feature-box">
            <img
              src="/secure-img.png"
              alt="Secure Document Storage"
              className="feature-icon"
            />
            Secure Document Storage
          </div>
          <div className="feature-box">
            <img
              src="/integrity-bg.png"
              alt="Immutability & Integrity"
              className="feature-icon"
            />
            Immutability & Integrity
          </div>
          <div className="feature-box">
            <img
              src="/user-access-img.png"
              alt="User Access Control"
              className="feature-icon"
            />
            User Access Control
          </div>
          <div className="feature-box">
            <img
              src="/transparency-img.png"
              alt="Transparency & Auditability"
              className="feature-icon"
            />
            Transparency & Auditability
          </div>
          <div className="feature-box">
            <img
              src="/doc-retrieval-img.png"
              alt="Easy Document Retrieval"
              className="feature-icon"
            />
            Easy Document Retrieval
          </div>
          <div className="feature-box">
            <img
              src="/ethereum-security-img.png"
              alt="Ethereum Blockchain Security"
              className="feature-icon"
            />
            Ethereum Blockchain Security
          </div>
        </div>
        
        {/* New Lawyer Registration Callout */}
        <div className="registration-callout">
          <h2>Are you a lawyer?</h2>
          <p>Apply for verified lawyer status to securely manage legal documents on the blockchain.</p>
          <button 
            onClick={() => navigate("/lawyer-registration")} 
            className="registration-button"
          >
            Apply for Lawyer Verification
          </button>
        </div>
      </section>

      {/* Support Center */}
      <section className="support-center">
        <div id="support-head">SUPPORT CENTER </div>
        <div id="support-para">
          Explore our resources or contact us for personalized support
        </div>
        <div className="support-grid">
          <div className="support-box">
            <img src="/chat-logo.png" alt="Chat Now" className="support-icon" />
            <h2>Chat Now</h2>
            <p>
              <i>Click to open live chat</i>
            </p>
          </div>
          <div className="support-box">
            <img
              src="/email-logo.png"
              alt="Email Us"
              className="support-icon"
            />
            <h2>Email Us</h2>
            <p>
              <i>Send us a message, and we'll respond shortly</i>
            </p>
          </div>
          <div className="support-box">
            <img
              src="/faq-img.png"
              alt="Browse FAQs"
              className="support-icon"
            />
            <h2>Browse FAQs</h2>
            <p>
              <i>Get answers to common questions</i>
            </p>
          </div>
          <div className="support-box">
            <img src="/call-img.png" alt="Call Us" className="support-icon" />
            <h2>Call Us</h2>
            <p>
              <i>Talk to our support team directly</i>
            </p>
          </div>
        </div>
        <footer className="footer">
          <a href="#">About Us</a>
          <a href="#">Terms of Service</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Contact Us</a>
        </footer>
      </section>
    </div>
  );
};

export default Homepage;
