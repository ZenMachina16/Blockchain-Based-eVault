// const mongoose = require("mongoose");

// const CaseSchema = new mongoose.Schema(
//   {
//     lawyer: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     client: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     caseTitle: { type: String, required: true },
//     summary: { type: String },
//     caseType: {
//       type: String,
//       enum: ["Civil", "Criminal", "Family", "Corporate"],
//       required: true,
//     },
//     status: {
//       type: String,
//       enum: ["Open", "Closed", "In Progress"],
//       default: "Open",
//     },
//     filingDate: { type: Date, default: Date.now },
//     partiesInvolved: {
//       opposingPartyName: { type: String },
//       opposingCounsel: { type: String },
//       opposingContact: { type: String },
//     },
//     courtDetails: {
//       courtName: { type: String },
//       judgeName: { type: String },
//     },
//     importantDates: [{ type: Date }],
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Case", CaseSchema);
// models/Case.js
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
      required: true,
      enum: ["Civil", "Criminal", "Family", "Corporate"],
    },
    status: {
      type: String,
      required: true,
      enum: ["Open", "In Progress", "Closed"],
      default: "Open",
    },
    summary: {
      type: String,
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
      opposingPartyName: String,
      opposingCounsel: String,
      opposingContact: String,
    },
    courtDetails: {
      courtName: String,
      judgeName: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Case", CaseSchema);