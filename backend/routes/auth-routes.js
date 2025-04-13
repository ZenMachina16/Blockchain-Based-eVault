const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/User"); // Your updated Mongoose model
const { authenticateToken } = require("../middleware/auth");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Register endpoint
router.post("/register", async (req, res) => {
  try {
    // Extract wallet as an optional field
    const { email, password, role, wallet } = req.body;
    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Email, password, and role are required." });
    }

    // Check if user already exists in the DB
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    // Hash the password and create a new user document
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: hashedPassword,
      role,
      wallet: wallet || undefined, // wallet is optional
    });
    const savedUser = await newUser.save();

    console.log(`User registered: ${savedUser.email}`);
    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Login endpoint remains unchanged
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    // Find user in the DB
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    console.log(`User logged in: ${email}`);
    // Sign and return a JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" },
    );
    res.json({ token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// In your backend user-routes.js
router.get("/check-client/:email", authenticateToken, async (req, res) => {
  try {
    const client = await User.findOne({ 
      email: req.params.email,
      role: "client" 
    });
    
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    
    // Client exists
    res.status(200).json({ message: "Client found" });
  } catch (error) {
    console.error("Error checking client:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
