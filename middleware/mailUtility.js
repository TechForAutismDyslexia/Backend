const nodemailer = require("nodemailer");

const sendmail = (parentEmail, subject, text) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Use true for port 465, false for all other ports
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS,
    },
  });

  const mailOptions = {
    from: `"TechForAutismAndDyslexia" <info@joywithlearning.com>`,
    to: parentEmail,
    subject: subject,
    text: text,
  };
  let resp;
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      resp = false;
    } else {
      resp = true;
    }
  });
  return resp;
};
module.exports = sendmail;
