const Case = require("../models/Case");
const User = require("../models/User");

// Create a new case
exports.createCase = async (req, res) => {
  try {
    const { clientEmail, ...caseData } = req.body;

    // Check if client exists
    const client = await User.findOne({ email: clientEmail, role: "client" });
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const newCase = new Case({
      ...caseData,
      clientEmail,
      createdBy: req.user.id,
    });

    await newCase.save();
    res.status(201).json(newCase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all cases for a lawyer
exports.getLawyerCases = async (req, res) => {
  try {
    const cases = await Case.find({ createdBy: req.user.id });
    res.json(cases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all cases for a client
exports.getClientCases = async (req, res) => {
  try {
    const cases = await Case.find({ clientEmail: req.user.email });
    res.json(cases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get case details by ID
exports.getCaseById = async (req, res) => {
  try {
    const caseItem = await Case.findById(req.params.id);
    if (!caseItem) {
      return res.status(404).json({ message: "Case not found" });
    }

    // Check if user has access to this case
    const hasAccess = 
      req.user.role === "lawyer" && caseItem.createdBy.toString() === req.user.id ||
      req.user.role === "client" && caseItem.clientEmail === req.user.email;

    if (!hasAccess) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(caseItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update case
exports.updateCase = async (req, res) => {
  try {
    const caseItem = await Case.findById(req.params.id);
    if (!caseItem) {
      return res.status(404).json({ message: "Case not found" });
    }

    // Only the lawyer who created the case can update it
    if (caseItem.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updatedCase = await Case.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedCase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete case
exports.deleteCase = async (req, res) => {
  try {
    const caseItem = await Case.findById(req.params.id);
    if (!caseItem) {
      return res.status(404).json({ message: "Case not found" });
    }

    // Only the lawyer who created the case can delete it
    if (caseItem.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Case.findByIdAndDelete(req.params.id);
    res.json({ message: "Case deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
