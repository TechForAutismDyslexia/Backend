const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Child = require("../models/child");
const Centre = require("../models/Centre");
const Game = require("../models/GameStatus");
const Appointment = require("../models/Appointment");
const Consultation = require("../models/Consultations");
const router = express.Router();
const auth = require("../middleware/auth");
const jwlUser = require("../models/jwlUserSchema");
const path = require("path");
const fs = require("fs");
const sendmail = require("../middleware/mailUtility");
const fileUpload = require("express-fileupload");
router.use(fileUpload());
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

router.post("/bookAppointment", auth, async (req, res) => {
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

  try {
    const sanitizedEmail = email.split("@")[0];
    const pdfBuffer = req.files.pdf.data;
    const uploadDir = "/home/uploads/childReports/";
    const filePath = path.join(uploadDir, `${sanitizedEmail}_report.pdf`);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    fs.writeFile(filePath, pdfBuffer, (err) => {
      if (err) {
        console.error("Error saving file:", err);
        return res.status(500).send({
          success: false,
          message: "Failed to save the file.",
        });
      }
      return res.status(200).send({
        success: true,
        message: "File uploaded successfully.",
      });
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).send({
      success: false,
      message: "Failed to upload file.",
    });
  }

  const status = req.user.role === "admin" ? "confirmed" : "pending";

  try {
    const appointment = new Appointment({
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
      // medicalReports: `https://${connectionString.split(";")[1].split("=")[1]}.blob.core.windows.net/${containerName}/${blobName}`,
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
      const mailsendresponse = sendmail(
        email,
        "Appointment Booking",
        `Your Appointment booking request for ${appointmentDate} at ${time} has been sent to Admin. Please wait for confirmation.`
      );
      if (mailsendresponse === false) {
        return res
          .status(500)
          .json({ success: false, message: "Error sending mail" });
      }
      return res
        .status(200)
        .send("Appointment booked, awaiting admin approval.");
    }
    try {
      const mailsendresponse = sendmail(
        email,
        "Appointment Booking",
        `Your Appointment booking has been booked for ${appointmentDate} at ${time}. Please be 15mins prior to the Appointment time.`
      );
      if (mailsendresponse === false) {
        return res
          .status(500)
          .json({ success: false, message: "Error sending mail" });
      }
      return res.status(200).send("Appointment booked successfully");
    } catch (err) {
      return res.status(500).send({ error: "Failed to send email" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).send({ error: "Failed to book appointment" });
  }
});

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
          text: `Your Appointment booking has been ${status} for ${appointment.appointmentDate} at ${appointment.time}. Please contact Admin for further details.`,
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

router.get("/getAppointments", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("Access Denied");

  try {
    const appointments = await Appointment.find({ status: "pending" });

    res.send(appointments);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/getConsultations/:doctorID/:date", auth, async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "parent")
    return res.status(403).send("Access Denied");

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

router.get("/get-jwl-enquiries", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("Access Denied");

  try {
    const enquiries = await jwlUser.find({});
    res.send(enquiries);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/get-jwluser-video/:parentEmail", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("Access Denied");

  try {
    const parentEmail = req.params.parentEmail;
    const sanitizedEmail = parentEmail.split("@")[0];
    const videoDir = "/home/uploads/jwluploads/";
    const videoPath = path.join(videoDir, `${sanitizedEmail}.mp4`);
    res.sendFile(videoPath);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.delete("/delete-jwl-enquiry/:parentEmail", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("Access Denied");

  try {
    const parentEmail = req.params.parentEmail;
    const enquiry = await jwlUser.deleteOne({ parentEmail: parentEmail });
    const sanitizedEmail = parentEmail.split("@")[0];
    const videoPath = `/home/uploads/jwluploads/${sanitizedEmail}.mp4`;
    fs.unlink(videoPath,(err) => {
      if (err) {
        // console.error('Error deleting the file:', err);
      } else {
        // console.log('File deleted successfully');
      }
    });
    res.status(200).send(enquiry);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});
module.exports = router;
