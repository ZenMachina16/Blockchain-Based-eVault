
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "./CSS/Register.css"; // Ensure this path is correct
// const Register = () => {
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//     role: "",
//     wallet: "", // Optional wallet field for MetaMask users
//   });
//   const [message, setMessage] = useState("");
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setMessage(""); // Clear previous messages

//     try {
//       const response = await fetch("http://localhost:5000/auth/register", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(formData),
//       });

//       const data = await response.json();
//       if (response.ok) {
//         setMessage("Registration successful! You can now log in.");
//       } else {
//         setMessage(data.message || "Registration failed.");
//       }
//     } catch (error) {
//       setMessage("Server error. Please try again.");
//     }
//   };

//   return (
//     <div className="register-container">
//       <div id="register">
//         <h2>Register</h2>
//       </div>
//       {message && <p>{message}</p>}
//       <form onSubmit={handleSubmit}>
//         <input
//           type="email"
//           name="email"
//           placeholder="Email"
//           value={formData.email}
//           onChange={handleChange}
//           required
//         />
//         <input
//           type="password"
//           name="password"
//           placeholder="Password"
//           value={formData.password}
//           onChange={handleChange}
//           required
//         />
//         <select
//           name="role"
//           value={formData.role}
//           onChange={handleChange}
//           required
//         >
//           <option value="">Select Role</option>
//           <option value="client">Client</option>
//           <option value="lawyer">Lawyer</option>
//           <option value="admin">Admin</option>
//         </select>
//         <input
//           type="text"
//           name="wallet"
//           placeholder="Wallet Address (optional)"
//           value={formData.wallet}
//           onChange={handleChange}
//         />
//         <button type="submit">Register</button>
//         <p id="loginPrompt">
//           Already have an account?{" "}
//           <button
//             type="button"
//             className="link-button"
//             onClick={() => navigate("/login")}
//           >
//             Login here
//           </button>
//         </p>
//       </form>
//     </div>
//   );
// };

// export default Register;


import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CSS/Register.css"; 
const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
    wallet: "", // Wallet field for MetaMask users
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle MetaMask Connection
  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setFormData({ ...formData, wallet: accounts[0] }); // Fill wallet field
      } catch (error) {
        setMessage("MetaMask connection failed. Please try again.");
      }
    } else {
      setMessage("MetaMask is not installed. Please install it to connect.");
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); // Clear previous messages

    try {
      const response = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Registration successful! You can now log in.");
      } else {
        setMessage(data.message || "Registration failed.");
      }
    } catch (error) {
      setMessage("Server error. Please try again.");
    }
  };

  return (
    <div className="bg-reg-container">
      <div className="register-container">
        <div id="register-title">
          <h2>Register</h2>
        </div>
        {message && <p className="register-message">{message}</p>}
      
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Create a strong password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="">Select your role</option>
            <option value="client">Client</option>
            <option value="lawyer">Lawyer</option>
            <option value="admin">Admin</option>
          </select>
          <input
            type="text"
            name="wallet"
            placeholder="Wallet Address (connect via MetaMask)"
            value={formData.wallet}
            onChange={handleChange}
            readOnly
          />
          <button
            type="button"
            className="connect-metamask"
            onClick={connectMetaMask}
          >
            Connect MetaMask
          </button>
          <button type="submit">Register</button>
          <p id="loginPrompt">
            Already have an account?{" "}
            <button
              type="button"
              className="link-button"
              onClick={() => navigate("/login")}
            >
              Login here
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
