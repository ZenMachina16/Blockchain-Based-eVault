const express = require("express");
const router = express.Router();
const caseController = require("../controllers/caseController");
const { authenticateToken } = require("../middleware/auth");

// Create a new case (lawyers only)
router.post("/create", authenticateToken, caseController.createCase);

// Get all cases for the logged-in lawyer
router.get("/lawyer", authenticateToken, caseController.getLawyerCases);

// Get all cases for the logged-in client
router.get("/client", authenticateToken, caseController.getClientCases);

// Get case details by ID (accessible by both lawyer and client)
router.get("/:id", authenticateToken, caseController.getCaseById);

// Update case (lawyers only)
router.put("/:id", authenticateToken, caseController.updateCase);

// Delete case (lawyers only)
router.delete("/:id", authenticateToken, caseController.deleteCase);

module.exports = router;