const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/User");
const authenticateToken = require("../middleware/auth");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// ============================
// @route   POST /api/auth/register
// @desc    Register a new user
// ============================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, wallet } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Name, email, password, and role are required.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      wallet: wallet || undefined,
    });

    const savedUser = await newUser.save();

    console.log(`User registered: ${savedUser.email}`);
    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ============================
// @route   POST /api/auth/login
// @desc    Login and return JWT
// ============================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log(`User logged in: ${user.email}`);
    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ============================
// @route   GET /api/auth/current-user
// @desc    Get current logged-in user's data
// ============================
router.get("/current-user", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Fetch current-user error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ============================
// @route   GET /api/auth/check-client/:email
// @desc    Check if email exists and belongs to a client
// ============================
router.get("/check-client/:email", authenticateToken, async (req, res) => {
  try {
    const client = await User.findOne({
      email: req.params.email,
      role: "client",
    });

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(200).json({ message: "Client found" });
  } catch (error) {
    console.error("Check client error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
