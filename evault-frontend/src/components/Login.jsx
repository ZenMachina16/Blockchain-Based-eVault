import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CSS/Login.css"; // Ensure this path is correct

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log("Login successful:", data);
        localStorage.setItem("token", data.token);
        navigate("/lawyer-dashboard");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred during login.");
    }
  };

  return (
    <div className="login">
      <div className="overlay"></div>
      <div id="evault">Evault</div>
      <form onSubmit={handleLogin}>
        <div className="form-content">
          <div className="input-container">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-container">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="alert">{error}</p>}
        </div>
        <button type="submit">Login</button>
      <p id="registerPrompt">
  Don't have an account?{" "}
  <button
    type="button"
    className="link-button"
    onClick={() => navigate("/register")}
  >
    Register here
  </button>
</p>

      </form>
    </div>
  );
};

export default Login;
