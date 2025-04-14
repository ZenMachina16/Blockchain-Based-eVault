const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const authenticateToken = require("../middleware/auth");
const LawyerProfile = require("../models/LawyerProfile");

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'profile-pictures');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      const error = new Error('Only .png, .jpg and .gif format allowed!');
      error.code = 'INVALID_FILE_TYPE';
      return cb(error, false);
    }
    cb(null, true);
  }
});

// Get lawyer profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const profile = await LawyerProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update lawyer profile
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const profile = await LawyerProfile.findOneAndUpdate(
      { userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload profile picture
router.post("/profile/picture", authenticateToken, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const profile = await LawyerProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Delete old profile picture if it exists
    if (profile.profilePicture) {
      const oldPicturePath = path.join(__dirname, '..', profile.profilePicture.replace(/^\/uploads/, 'uploads'));
      if (fs.existsSync(oldPicturePath)) {
        fs.unlinkSync(oldPicturePath);
      }
    }

    // Update profile with new picture path
    const relativePath = path.relative(
      path.join(__dirname, '..'),
      req.file.path
    ).replace(/\\/g, '/');
    
    profile.profilePicture = '/' + relativePath;
    await profile.save();

    res.json({ 
      message: "Profile picture updated successfully",
      profilePicture: profile.profilePicture
    });
  } catch (error) {
    console.error('Upload error:', error);
    if (error.code === 'INVALID_FILE_TYPE') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 