const mongoose = require("mongoose");

const CaseSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: true,
    },
    clientEmail: {
      type: String,
      required: true,
    },
    caseTitle: {
      type: String,
      required: true,
    },
    caseDescription: {
      type: String,
      required: true,
    },
    caseType: {
      type: String,
      enum: ["Civil", "Criminal", "Family", "Corporate"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Open", "Closed", "In Progress"],
      default: "Open",
    },
    filingDate: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    partiesInvolved: {
      opposingPartyName: { type: String },
      opposingCounsel: { type: String },
      opposingContact: { type: String },
    },
    courtDetails: {
      courtName: { type: String },
      judgeName: { type: String },
      caseNumber: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Case", CaseSchema);