const jwlUser = require("../models/jwlUserSchema");
const jwlFeedback = require('../models/jwlFeedback');
const knowMore = require("../models/knowMoreSchema");
const jwlauth = require("../middleware/jwlauth");
const OTP = require("../models/otpSchema");
const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();
require("dotenv").config();
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const upload = multer({
  storage: multer.memoryStorage(),
});
const { BlobServiceClient } = require("@azure/storage-blob");
const jwlauth = require("../middleware/jwlauth");
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post("/enquire", jwlauth, upload.single("video"), async (req, res) => {
  try {
    // Get input data
    const { storedData } = req.body;
    console.log(storedData);
    const {
      childName,
      childAge,
      childGender,
      parentName,
      parentPhoneNo,
      parentEmail,
    } = JSON.parse(storedData);

    // Check if all details are provided
    if (
      !childName ||
      !childAge ||
      !childGender ||
      !parentName ||
      !parentPhoneNo ||
      !parentEmail
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
    });

    await OTP.deleteMany({ email: parentEmail });

    try {
      const blobServiceClient = BlobServiceClient.fromConnectionString(
        "DefaultEndpointsProtocol=https;AccountName=kmpvr;AccountKey=E4n9UoVMQTJviH8sEjTBO8tk5DwHpd2QuMWE+buz/wSzDBT5m4NrZ/DSC8O975eyY28xyun7zaol+AStv4nx5w==;EndpointSuffix=core.windows.net"
      );
      const containerName = "test1";
      const containerClient =
        blobServiceClient.getContainerClient(containerName);
      const blobName = `${parentEmail}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      await blockBlobClient.uploadData(req.file.buffer, {
        blobHTTPHeaders: { blobContentType: req.file.mimetype },
      });

      const videoUrl = blockBlobClient.url;

      // Send Success Message via email
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // Use `true` for port 465, `false` for all other ports
        auth: {
          user: "kmpvr2.0@gmail.com",
          pass: "ojqmczhvzldnbbzv",
        },
      });

      const mailOptions = {
        from: `"TechForAutismAndDyslexia" <kmpvr2.0@gmail.com>`,
        to: parentEmail,
        subject: "Enquiry Success",
        text: `Your details are uploaded successfully. Our admin will contact you shortly . . .`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(500).send("Error sending OTP");
        }
        return res.status(200).json({
          success: true,
          message: "Video Uploaded Successfully, Success Email sent",
        });
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User Enquiry failed",
    });
  }
});

router.post("/know-more", jwlauth, async (req, res) => {
  try {
    const {
      childName,
      childAge,
      childGender,
      parentName,
      parentPhoneNo,
      parentEmail,
      video1,
      video2,
      video3,
    } = req.body;

    // Check if all details are provided
    if (
      !childName ||
      !childAge ||
      !childGender ||
      !parentName ||
      !parentPhoneNo ||
      !parentEmail
    ) {
      return res.status(403).send({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if user already exists
    const existingUser = await knowMore.findOne({ parentEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Create user
    const newUser = await knowMore.create({
      childName,
      childAge,
      parentName,
      parentEmail,
      parentPhoneNo,
      childGender,
      video1,
      video2,
      video3,
    });

    await OTP.deleteMany({ email: parentEmail });

    try {
      // Send Success Message via email
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // Use `true` for port 465, `false` for all other ports
        auth: {
          user: "kmpvr2.0@gmail.com",
          pass: "ojqmczhvzldnbbzv",
        },
      });

      const mailOptions = {
        from: `"TechForAutismAndDyslexia" <kmpvr2.0@gmail.com>`,
        to: parentEmail,
        subject: "Enquiry Success",
        text: `Your details are uploaded successfully. Our admin will contact you shortly . . .`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(500).send("Error sending OTP");
        }
        return res
          .status(200)
          .json({ success: true, message: "Success Email sent" });
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User Enquiry failed",
    });
  }
});

router.post("/send-otp", async (req, res) => {
  console.log(req.body);
  try {
    // Get input data
    const { otpEmail } = req.body;

    // Check if all details are provided
    if (!otpEmail) {
      return res.status(403).send({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if user already exists
    const existingUser = await jwlUser.findOne({ otpEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    existingUser = await knowMore.findOne({ otpEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Generate OTP
    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

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

    console.log(
      process.env.NODEMAILER_AUTH_USER,
      process.env.NODEMAILER_AUTH_PASSWORD
    );

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // Use `true` for port 465, `false` for all other ports
      auth: {
        user: "kmpvr2.0@gmail.com",
        pass: "ojqmczhvzldnbbzv",
      },
    });

    const mailOptions = {
      from: `"TechForAutismAndDyslexia" <kmpvr2.0@gmail.com>`,
      to: otpEmail,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).send("Error sending OTP");
      }
      return res.status(200).json({
        success: true,
        message:
          "Email Sent\nPlease Provide the OTP within 5 minutes otherwise OTP will be Invalid!!",
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User Enquiry failed",
    });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(403).json({
        success: false,
        message: "All Fields are required",
      });
    }

    const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);

    if (response.length === 0 || otp !== response[0].otp) {
      return res.status(400).json({
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



router.post('/feedback', async (req, res) => {
    const { name, email, feedback } = req.body;
    const userfeedback = new jwlFeedback({ name, email, feedback });
    try {
        const savedFeedback = await jwlFeedback.save();
        res.send(savedFeedback);
    } catch (err) {
        res.status(400).send(err);
    }
});
