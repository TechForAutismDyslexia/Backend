const mongoose = require("mongoose");

const jwlUserSchema = new mongoose.Schema({
  childName: {
    type: String,
    required: true,
    trim: true,
  },
  childAge: {
    type: Number,
    required: true,
  },
  parentName: {
    type: String,
    required: true,
    trim: true,
  },
  parentEmail: {
    type: String,
    required: true,
    trim: true,
  },
  parentPhoneNo: {
    type: String,
    required: true,
    trim: true,
  },
  childGender: {
    type: String,
    required: true,
    trim: true,
  },
  preferredCenter:{
    type: String,
    required: true,
    trim: true,
  },
  isVerified: {
    type: Boolean,
    required: true,
    default: false,
  },
});

module.exports = mongoose.model("jwlUser", jwlUserSchema);
