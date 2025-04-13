// const mongoose = require("mongoose");

// const UserSchema = new mongoose.Schema(
//   {
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     wallet: { type: String, unique: true, sparse: true }, // Only for MetaMask users
//     role: {
//       type: String,
//       enum: ["lawyer", "client", "admin"],
//       default: "client",
//     },
//     permissions: { type: [String], default: [] },
//   },
//   { timestamps: true },
// );

// module.exports = mongoose.model("User", UserSchema);
// models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["client", "lawyer", "admin"],
    default: "client"
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", UserSchema);