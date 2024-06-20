const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Userdata = require('../models/Userdata');
const router = express.Router();
const auth = require('../middleware/auth');
// Register
router.post('/register', async (req, res) => {
  const { username, password} = req.body;
  const role = 'parent';
  //check if user already exists
  const user = await User.findOne({ username});
  if (user) return res.status(400).send('User already exists');
  const hashedPassword = await bcrypt.hash(password, 10);
  const users = new User({ username, password: hashedPassword, role });

  try {
    const savedUser = await users.save();
    res.send(savedUser);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).send('Username or password is wrong');

  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) return res.status(400).send('Invalid password');

  const token = jwt.sign({ id: user._id }, '8328211811');
  res.header('Authorization', token).send(token);
});

// update userdata
router.post('/userdatafill',auth, async (req, res) => {
  if(req.user.role == 'admin') return res.status(403).send('Access Denied');
  const {name,mobilenumber} = req.body;
  const role = req.user.role;
  const userId = req.user._id;
  const username = req.user.username;
  const status = true;
  const userdata = new Userdata({name,mobilenumber,role,userId,username,status});
  try {
    const savedUserdata = await userdata.save();
    res.send(savedUserdata);
  } catch (err) {
    res.status(400).send(err);
  }
});
module.exports = router;