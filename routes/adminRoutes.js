const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Child = require("../models/child");
const Centre = require("../models/Centre");
const Game = require("../models/GameStatus");
const Appointment = require("../models/Appointment");
const Consultation = require("../models/Consultations");
const router = express.Router();
const auth = require('../middleware/auth');
const jwlUser = require('../models/jwlUserSchema');
const multer = require('multer');
const path = require('path');
const { BlobServiceClient } = require('@azure/storage-blob');
const nodemailer = require('nodemailer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads"); // Ensure 'uploads' directory exists
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + "-" + file.originalname);
    },
  });

  const uploads = multer({
    storage,
    fileFilter: (req, file, cb) => {
      if (file.mimetype === "application/pdf") {
        cb(null, true);
      } else {
        cb(new Error("Only PDF files are allowed"), false);
      }
    },
  });

//Admin assigns doctor and caretaker
router.put("/:id/assign", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("Access Denied");

  const { caretakerId, doctorId } = req.body;

  try {
    const child = await Child.findById(req.params.id);
    if (!child) return res.status(404).send("Child not found");

    child.caretakerId = caretakerId;
    const caretakerName = await User.findById(caretakerId);
    child.doctorId = doctorId;
    const doctorName = await User.findById(doctorId);
    child.adminStatus = true;
    child.caretakerName = caretakerName.name;
    child.doctorName = doctorName.name;

    const updatedChild = await child.save();
    res.send(updatedChild);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Register Caretaker
router.post("/careTakerRegister", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("Access Denied");
  const { username, password, name, mobilenumber, email } = req.body;
  const role = "caretaker";
  //check if user already exists
  const user = await User.findOne({ username });
  if (user) return res.status(400).send("User already exists");
  const hashedPassword = await bcrypt.hash(password, 10);
  const users = new User({
    username,
    password: hashedPassword,
    role,
    name,
    mobilenumber,
    email,
  });
  try {
    const savedUser = await users.save();
    res.send(savedUser);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Register Doctor
router.post("/doctorRegister", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("Access Denied");
  const { username, password, name, mobilenumber, email } = req.body;
  const role = "doctor";
  const user = await User.findOne({ username });
  if (user) return res.status(400).send("User already exists");
  const hashedPassword = await bcrypt.hash(password, 10);
  const users = new User({
    username,
    password: hashedPassword,
    role,
    name,
    mobilenumber,
    email,
  });
  try {
    const savedUser = await users.save();
    res.send(savedUser);
  } catch (err) {
    res.status(400).send(err);
  }
});

//to retrive all children played that game
router.get("/gamedetails/:gameid", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("Access Denied");
  // const centre = req.params.centreId;
  const centredetails = await Centre.findOne({ centerid: req.user._id });
  const centre = centredetails.centreId;
  const gamer = req.params.gameid;
  try {
    const games = await Game.find({ gameId: gamer });
    //get child details from childid fetched from games
    fetchchildId = games.map((game) => game.childId);
    const children = await Child.find({ _id: fetchchildId, centreId: centre });
    res.send(children);
  } catch (err) {
    res.status(400).send(err);
  }
});
router.get("/gametable/:childId", auth, async (req, res) => {
  const childId = req.params.childId;
  try {
    const games = await Game.find({ childId: childId });
    res.send(games);
  } catch (err) {
    res.status(400).send(err);
  }
});

const upload = multer();

router.post(
  "/bookAppointment",
  auth,
  upload.single("pdf"),
  async (req, res) => {
    if (req.user.role !== "admin" && req.user.role !== "parent") {
      return res.status(403).send("Access Denied");
    }

    const {
      email,
      parentName,
      parentId,
      childName,
      dob,
      appointmentDate,
      gender,
      parentPhoneNo,
      alternativeNumber,
      address,
      schoolName,
      classGrade,
      schoolBoard,
      consultationType,
      referredBy,
      childConcerns,
      branch,
      doctorId,
      time,
    } = req.body;
    const sanitizedParentId = parentId === "null" ? null : parentId;    
    
    try {
      const existingSlot = await Consultation.findOne({
        doctorID: doctorId,
        "slots.date": appointmentDate,
        "slots.time": time,
        "slots.booked": true,
      });

      if (existingSlot) {
        return res
          .status(400)
          .send({ error: "The selected time slot is already booked." });
      }
    } catch (err) {
      return res
        .status(500)
        .send({ error: "Failed to check appointment availability" });
    }
    

    if (req.file) {
      try {
        console.log("parent Id " + parentId);
        const pdfBuffer = req.file.buffer;
        const blobName = `report_${childName}.pdf`;
        const blobServiceClient = BlobServiceClient.fromConnectionString(
          "DefaultEndpointsProtocol=https;AccountName=" +
            process.env.AZURE_ACCOUNT_NAME +
            ";AccountKey=" +
            process.env.AZURE_ACCOUNT_KEY +
            "==;EndpointSuffix=core.windows.net"
        );
        const containerName = "tadchildreports";
        const containerClient =
          blobServiceClient.getContainerClient(containerName);

        await containerClient.createIfNotExists();

        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.uploadData(pdfBuffer, {
          blobHTTPHeaders: { blobContentType: req.file.mimetype },
        });
      } catch (err) {
        return res.status(500).send({ error: "Failed to upload file" });
      }
    }

    const status = req.user.role === "admin" ? "confirmed" : "pending";

    try {
      const appointment = new Appointment({
        email,
        parentName,
        parentId:sanitizedParentId,
        childName,
        dob,
        appointmentDate,
        gender,
        parentPhoneNo,
        alternativeNumber,
        address,
        schoolName,
        classGrade,
        schoolBoard,
        consultationType,
        referredBy,
        childConcerns,
        branch,
        time,
        doctorId,
        status,
      });

      await appointment.save();

      if (status === "confirmed") {
        const existingConsultation = await Consultation.findOne({
          doctorID: doctorId,
          parentID: null,
          "slots.date": appointmentDate,
        });

        if (existingConsultation) {
          existingConsultation.slots.push({
            date: appointmentDate,
            time,
            booked: true,
            appointmentID: appointment._id,
          });
          await existingConsultation.save();
        } else {
          const newConsultation = new Consultation({
            doctorID: doctorId,
            slots: [
              {
                date: appointmentDate,
                time,
                booked: true,
                appointmentID: appointment._id,
              },
            ],
          });
          await newConsultation.save();
        }
      } else {
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: process.env.NODEMAILER_USER,
            pass: process.env.NODEMAILER_PASS,
          },
        });

        const mailOptions = {
          from: `"TechForAutismAndDyslexia" <kmpvr2.0@gmail.com>`,
          to: email,
          subject: "Appointment Booking",
          text: `Your Appointment booking request for ${appointmentDate} at ${time} has been sent to Admin. Please wait for confirmation.`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return res
              .status(500)
              .json({ success: false, message: "Error sending mail" });
          }
          return res.status(200).json({
            success: true,
            message: "Email Sent Successfully",
          });
        });
        return res
          .status(200)
          .send("Appointment booked, awaiting admin approval.");
      }
      try {
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: process.env.NODEMAILER_USER,
            pass: process.env.NODEMAILER_PASS,
          },
        });

        const mailOptions = {
          from: `"TechForAutismAndDyslexia" <kmpvr2.0@gmail.com>`,
          to: email,
          subject: "Appointment Booking",
          text: `Your Appointment booking has been booked for ${appointmentDate} at ${time}. Please be 15mins prior to the Appointment time.`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return res
              .status(500)
              .json({ success: false, message: "Error sending mail" });
          }
          return res.status(200).json({
            success: true,
            message: "Email Sent Successfully",
          });
        });
      } catch (err) {
        return res.status(500).send({ error: "Failed to send email" });
      }

      res.status(200).send("Appointment booked successfully");
    } catch (err) {
      console.log(err);
      res.status(400).send({ error: "Failed to book appointment" });
    }
  }
);

router.put("/verifyAppointment/:appointmentID", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("Access Denied");

  try {
    let temp = false;

    const { appointmentID } = req.params;
    const { status } = req.body;

    const appointment = await Appointment.findById(appointmentID);
    const email = appointment.email;
    if (!appointment) return res.status(404).send("Appointment not found");
    appointment.status = status;
    await appointment.save();
    if (status === "confirmed") {
      const newConsultation = new Consultation({
        doctorID: appointment.doctorId,
        parentID: appointment.parentId,
        slots: [
          {
            date: appointment.appointmentDate,
            time: appointment.time,
            booked: true,
          },
        ],
      });

      try {
        temp = await newConsultation.save();
        console.log("temp" + temp);
      } catch (e) {
        res.status(401).send({ message: "mongoDB error" });
      }
    }
    if (temp || status == "rejected") {
      try {
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: process.env.NODEMAILER_USER,
            pass: process.env.NODEMAILER_PASS,
          },
        });

        const mailOptions = {
          from: `"TechForAutismAndDyslexia" <kmpvr2.0@gmail.com>`,
          to: appointment.email,
          subject: "Appointment Booking",
          text: `Your Appointment booking has been ${status} for ${appointment.appointmentDate} at ${appointment.time}. Please be 15 mins prior to appointment time.`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return res
              .status(500)
              .json({ success: false, message: "Error sending mail" });
          }
          return res.status(200).json({
            success: true,
            message: "Email Sent Successfully",
          });
        });
      } catch (err) {
        return res.status(500).send({ error: "Failed to send email" });
      }
    }
    res.send(appointment);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.put('/uploadPrescription/:appointmentID',auth,uploads.single('pdf'),async(req,res)=>{
    if (req.user.role !== 'admin') return res.status(403).send("Access Denied");
    const {appointmentID} = req.params;
       
        try{
            if(!req.file){
                return res.status(400).send("Presription not uploaded");
            }
            const filepath = `uploads/${req.file.filename}`;
            const appointment = await Appointment.findByIdAndUpdate(
                appointmentID,
                {prescription:filepath},
                {new:true}
            )
            if(!appointment){
                return res.status(400).send("Appointment not found");

            }
            res.status(200).send({
                message:"Prescription uploaded successfully",
                prescription:filepath,
                appointment
            })

        }
        catch(error){
            res.status(500).send('Internal server error');
        }
});

router.get('/getAppointments', auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).send("Access Denied");

    try {
        const appointments = await Appointment.find({ status: 'pending' });

    res.send(appointments);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get('/get-jwl-enquiries',auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).send("Access Denied");

    try {
        const enquiries = await jwlUser.find({});
        res.send(enquiries);
    } catch (err) {
        res.status(400).send(err);
    }
}
);

router.get('/get-jwluser-video/:parentEmail',auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).send("Access Denied");

    try {
        const parentEmail = req.params.parentEmail;
        const sanitizedEmail = parentEmail.split('@')[0];

        res.sendFile(path.join(__dirname,'../get-test-video.mp4'));
    } catch (err) {
        res.status(400).send(err);
    }
}
);

router.delete('/delete-jwl-enquiry/:parentEmail',auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).send("Access Denied");

    try {
        const parentEmail = req.params.parentEmail;
        const enquiry = await jwlUser.deleteOne({ parentEmail: parentEmail });;
        res.status(200).send(enquiry);
    } catch (err) {
        console.log(err);
        res.status(400).send(err);
    }
}
);

router.get('/getAppointments/:doctorID',auth,async(req,res)=>{
    if (req.user.role === 'caretaker') return res.status(403).send("Access Denied");
    try{
        const appointment = await Appointment.find({doctorId:req.params.doctorID,status:'confirmed'});
        res.send(appointment);
    }
    catch(error){
        res.status(500).send("Internal server error");
    }
})



router.get('/getConsultations/:doctorID/:date', auth, async (req, res) => {
    if (req.user.role !== 'admin' && req.user.role !== "parent") return res.status(403).send('Access Denied');

  try {
    const consultations = await Consultation.find({
      doctorID: req.params.doctorID,
      "slots.date": req.params.date,
    });

    res.send(consultations);
  } catch (err) {
    res.status(400).send(err);
  }
});
module.exports = router;
