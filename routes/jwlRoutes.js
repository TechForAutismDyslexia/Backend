const jwlUser = require("../models/jwlUserSchema");
const jwlFeedback = require("../models/jwlFeedback");
const jwlauth = require("../middleware/jwlauth");
const OTP = require("../models/otpSchema");
const jwt = require("jsonwebtoken");
const fileUpload = require("express-fileupload");
const express = require("express");
const router = express.Router();
require("dotenv").config();
const otpGenerator = require("otp-generator");
const sendmail = require("../middleware/mailUtility");
const path = require("path");
const fs = require("fs");

router.use(fileUpload());
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post("/send-otp", async (req, res) => {
  try {
    const { otpEmail } = req.body;
    if (!otpEmail) {
      return res.status(403).send({
        success: false,
        message: "OTP Email is required",
      });
    }
    console.log("otpEmail " + otpEmail);

    let existingUser = await jwlUser.findOne({ otpEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    console.log("existingUser " + existingUser);

    // Generate OTP
    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    console.log("otp " + otp);

    // Ensure OTP is unique (not strictly necessary for a one-time code)
    while (await OTP.findOne({ otp })) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
    }

    // Save OTP to database
    const otpPayload = { email: otpEmail, otp };
    const otpBody = await OTP.create(otpPayload);

    console.log("otpBody " + otpBody);

    try{
      const mailsendresponse = sendmail(
        otpEmail,
        "Your OTP Code",
        `Your OTP code is ${otp}`
      );
    }
    catch(err){
      return res.status(500).json({
        success: false,
        message: "Error sending OTP",
        error: err,
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Email Sent\nPlease Provide the OTP within 5 minutes otherwise OTP will be Invalid!!",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "User Enquiry failed",
      error: err,
    });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(403).json({
        success: false,
        message: "Email or OTP is missing",
      });
    }

    const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);

    if (response.length === 0 || otp !== response[0].otp) {
      return res.status(200).json({
        success: false,
        message: "The OTP is not valid",
      });
    }

    const token = jwt.sign({ email: email }, "jwltad", {
      expiresIn: "1h",
    });

    return res.status(200).json({
      success: true,
      message: "User verified successfully",
      token: token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "OTP Verification Failed",
    });
  }
});

router.post("/enquire", jwlauth, async (req, res) => {
  try {
    // Get input data
    const {
      childName,
      childAge,
      childGender,
      parentName,
      parentPhoneNo,
      parentEmail,
      preferredCenter,
      videoCall,
    } = req.body;

    const checklist = JSON.parse(req.body.checklist);

    console.log(req.body);

    // Check if all details are provided
    if (
      !childName ||
      !childAge ||
      !childGender ||
      !parentName ||
      !parentPhoneNo ||
      !parentEmail ||
      !preferredCenter ||
      !checklist
    ) {
      return res.status(403).send({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if user already exists
    const existingUser = await jwlUser.findOne({ parentEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Create user
    const newUser = await jwlUser.create({
      childName,
      childAge,
      parentName,
      parentEmail,
      parentPhoneNo,
      childGender,
      preferredCenter,
      videoCall,
      checklist,
    });

    const file = req.files.video;
    const sanitizedEmail = parentEmail.split("@")[0];
    const uploadDir = "/home/uploads/jwluploads/";
    const filePath = path.join(uploadDir, `${sanitizedEmail}.mp4`);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Save file to the uploads folder
    fs.writeFile(filePath, file.data, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send({
          success: false,
          message: "Failed to save the file.",
        });
      }
      // Send Success Message via email
      const mailsendres = sendmail(
        parentEmail,
        "Enquiry Success",
        `Your details are uploaded successfully. Our admin will contact you shortly . . .`
      );
      if (mailsendres.success === false) {
        return res
          .status(500)
          .json({ success: false, message: "Error saving details" });
      }
      return res.status(200).json({
        success: true,
        message: "Video Uploaded Successfully, Success Email sent",
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User Enquiry failed",
    });
  }
});

router.post("/feedback", async (req, res) => {
  const { name, email, feedback } = req.body;
  const existingUser = await jwlFeedback.findOne({ email });
  if (existingUser) {
    return res.json({
      success: false,
      message: "Feedback already given",
    });
  }
  const jwlUserFeedback = await jwlFeedback.create({ name, email, feedback });
  try {
    await jwlUserFeedback.save();
    return res.status(200).json({
      success: true,
      message: "Feedback Saved Successfully",
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Feedback Not Saved",
    });
  }
});

module.exports = router;
