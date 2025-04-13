// const express = require("express");
// const router = express.Router();
// const caseController = require("../controllers/caseController");
// const { authenticateToken } = require("../middleware/auth");

// // Routes for case management
// router.post("/create", authenticateToken, caseController.createCase);
// router.get("/lawyer", authenticateToken, caseController.getLawyerCases);
// router.get("/client", authenticateToken, caseController.getClientCases);
// router.get("/:caseId",authenticateToken, caseController.getCaseDetails);

// module.exports = router;
// routes/caseRoutes.js
const express = require("express");
const router = express.Router();
const Case = require("../models/Case");
const User = require("../models/User"); // Assuming you have a User model
const auth = require("../middleware/auth"); // Assuming you have auth middleware

// Create a new case
router.post("/create", auth, async (req, res) => {
  try {
    const { 
      clientName, 
      clientEmail, 
      caseTitle, 
      caseDescription, 
      caseType, 
      status,
      summary,
      filingDate,
      partiesInvolved,
      courtDetails 
    } = req.body;

    // Verify client exists in system
    const clientExists = await User.findOne({ 
      email: clientEmail,
      role: "client" 
    });

    if (!clientExists) {
      return res.status(400).json({ 
        message: "Client with this email is not registered in the system" 
      });
    }

    // Check if user creating the case is a lawyer
    if (req.user.role !== "lawyer") {
      return res.status(403).json({ 
        message: "Only lawyers can create cases" 
      });
    }

    const newCase = new Case({
      clientName,
      clientEmail,
      caseTitle,
      caseDescription,
      caseType,
      status,
      summary,
      filingDate,
      partiesInvolved,
      courtDetails,
      createdBy: req.user.id
    });

    const savedCase = await newCase.save();
    res.status(201).json(savedCase);
  } catch (error) {
    console.error("Error creating case:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all cases for a lawyer
router.get("/lawyer", auth, async (req, res) => {
  try {
    console.log("User role in route:", req.user.role); // Debug log
    if (req.user.role !== "lawyer") {
      return res.status(403).json({ message: "Access denied" });
    }

    const cases = await Case.find({ createdBy: req.user.id });
    res.json(cases);
  } catch (error) {
    console.error("Error fetching lawyer cases:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all cases for a client
router.get("/client", auth, async (req, res) => {
  try {
    // Ensure user is a client
    if (req.user.role !== "client") {
      return res.status(403).json({ message: "Access denied" });
    }

    const cases = await Case.find({ clientEmail: req.user.email });
    res.json(cases);
  } catch (error) {
    console.error("Error fetching client cases:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get a specific case by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const caseItem = await Case.findById(req.params.id);
    
    if (!caseItem) {
      return res.status(404).json({ message: "Case not found" });
    }

    // Check if user has access
    const userIsLawyer = req.user.role === "lawyer";
    const userIsClient = req.user.role === "client" && req.user.email === caseItem.clientEmail;
    
    if (!(userIsLawyer || userIsClient)) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(caseItem);
  } catch (error) {
    console.error("Error fetching case:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update a case
router.put("/:id", auth, async (req, res) => {
  try {
    // Only lawyers can update cases
    if (req.user.role !== "lawyer") {
      return res.status(403).json({ message: "Only lawyers can update cases" });
    }

    const caseItem = await Case.findById(req.params.id);
    
    if (!caseItem) {
      return res.status(404).json({ message: "Case not found" });
    }

    // Check if lawyer created this case
    if (caseItem.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this case" });
    }

    const updatedCase = await Case.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(updatedCase);
  } catch (error) {
    console.error("Error updating case:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a case
router.delete("/:id", auth, async (req, res) => {
  try {
    // Only lawyers can delete cases
    if (req.user.role !== "lawyer") {
      return res.status(403).json({ message: "Only lawyers can delete cases" });
    }

    const caseItem = await Case.findById(req.params.id);
    
    if (!caseItem) {
      return res.status(404).json({ message: "Case not found" });
    }

    // Check if lawyer created this case
    if (caseItem.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this case" });
    }

    await Case.findByIdAndDelete(req.params.id);
    res.json({ message: "Case deleted successfully" });
  } catch (error) {
    console.error("Error deleting case:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;