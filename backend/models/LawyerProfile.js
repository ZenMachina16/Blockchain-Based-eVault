const mongoose = require("mongoose");

const LawyerProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  lawyerId: {
    type: String,
    required: true
  },
  barRegistrationNo: {
    type: String,
    required: true
  },
  yearsOfExperience: {
    type: Number,
    required: true
  },
  bio: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String,
    default: ""
  }
}, { timestamps: true });

module.exports = mongoose.model("LawyerProfile", LawyerProfileSchema); 