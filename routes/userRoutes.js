const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const auth = require('../middleware/auth');
const mailUtility = require('../middleware/mailUtility');

require('dotenv').config();
router.post('/register', auth, async (req, res) => {
  if(req.user.role !== 'admin') return res.status(403).send('Access Denied');

  const { username, password, name, mobilenumber,email} = req.body;
  const role = 'parent';
  const user = await User.findOne({ username});
  if (user) return res.status(401).send('User already exists');
  const hashedPassword = await bcrypt.hash(password, 10);
  const users = new User({ username, password: hashedPassword, role,name,mobilenumber,email });

  try {
    const savedUser = await users.save();
    const mailBody = `Thank you for contacting us. We hope you have a great experience with us. Your username is ${username} and password is ${password}.
    
    You can login to your account at https://portal.joywithlearning.com/login`;

    try{
        const mailResponse = mailUtility(email, 'Welcome to Joy With Learning', mailBody);
    }
    catch(err){
        return res.status(500).json({
            success: false,
            message: 'Mail not sent'
        });
    }
    
    res.send(savedUser);
  } catch (err) {
    res.status(400).send({success:false,message: 'User not saved'});
  }
});

router.post('/login', async (req, res) => {
  try{
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).send('Username or password is wrong');
  
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).send('Invalid password');
    const token = jwt.sign({ id: user._id, role : user.role }, process.env.JWT_SECRET,{expiresIn: '1h'});
    res.header('Authorization', token).send(token);
  }
  catch(err){
    res.status(400).send(err.message);
  }
});

module.exports = router;