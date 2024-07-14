const jwt = require('jsonwebtoken');
const OTP = require('../models/otpSchema');

module.exports = async (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).send('Access Denied');

  try {
    const verified = jwt.verify(token, 'jwltad');
    console.log(verified);
    req.user = await OTP.findOneAndDelete(verified.email);
    next();
  } catch (err) {
    res.status(400).send('Invalid Token');
  }
};
