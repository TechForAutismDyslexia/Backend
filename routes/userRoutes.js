const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const auth = require('../middleware/auth');
// Register
router.post('/register', async (req, res) => {
  const { username, password, name, mobilenumber,email} = req.body;
  const role = 'parent';
  //check if user already exists
  const user = await User.findOne({ username});
  if (user) return res.status(401).json({ error: 'Username already exists' });
  const hashedPassword = await bcrypt.hash(password, 10);
  const users = new User({ username, password: hashedPassword, role,name,mobilenumber,email });

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
  console.log(username,password);
  const user = await User.findOne({ username });
  if (!user) return res.status(401).send('Username or password is wrong');

  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) return res.status(400).send('Invalid password');

  const token = jwt.sign({ id: user._id, role : user.role }, '8328211811',{expiresIn: '1h'});
  res.header('Authorization', token).send(token);
});

module.exports = router;