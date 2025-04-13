const Case = require("../models/Case");
const User = require("../models/User");
// Create a new case
exports.createCase = async (req, res) => {
  try {
    const { clientEmail, caseTitle, caseType, caseDescription } = req.body;

    // Check if client exists
    const client = await User.findOne({ email: clientEmail, role: "client" });

    if (!client) {
      return res.status(400).json({
        message: "Client not registered. Please register the client first.",
      });
    }

    // Create the case if client exists
    const newCase = new Case({
      caseTitle,
      caseDescription,
      lawyer: req.user.id,
      caseType,
      client: client._id,
    });
    await newCase.save();

    res.status(201).json(newCase);
  } catch (error) {
    console.error("Error in createCase:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Get all cases for a lawyer
exports.getLawyerCases = async (req, res) => {
  try {
    const cases = await Case.find({ lawyer: req.user.id }).populate("client");
    res.status(200).json(cases);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to retrieve cases" });
  }
};

// Get all cases for a client
exports.getClientCases = async (req, res) => {
  try {
    const cases = await Case.find({ client: req.user.id }).populate("lawyer");
    res.status(200).json(cases);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to retrieve cases" });
  }
};

// Get details of a specific case
exports.getCaseDetails = async (req, res) => {
  try {
    const caseDetails = await Case.findById(req.params.caseId).populate([
      "lawyer",
      "client",
    ]);
    res.status(200).json(caseDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to retrieve case details" });
  }
};
