const mongoose = require("mongoose");

const knowMore = new mongoose.Schema({
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
  video1: {
    type: String,
    required: true,
    trim: true,
  },
  video2: {
    type: String,
    required: true,
    trim: true,
  },
  video3: {
    type: String,
    required: true,
    trim: true,
  },
  isVerified: {
    type: Boolean,
    required: true,
    default: true,
  },
});

module.exports = mongoose.model("KnowMore", knowMore);
