const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Userdata = require('../models/Userdata');
const router = express.Router();
const auth = require('../middleware/auth');

// Register
router.post('/careTakerRegister',auth, async (req, res) => {
    if(req.user.role !== 'admin') return res.status(403).send("Access Denied");
    const{username,password} = req.body;
    const role = 'caretaker';
    //check if user already exists
    const user = await User.findOne({username});
    if(user) return res.status(400).send('User already exists');
    const hashedPassword = await bcrypt.hash(password, 10)
    const users = new User({username,password:hashedPassword,role});
    try{
        const savedUser = await users.save();
        res.send(savedUser);    
    }
    catch(err){ 
        res.status(400).send(err);
    }
});

router.post("/doctorRegister",auth,async (req,res)=>{
    if(req.user.role !== 'admin') return res.status(403).send("Access Denied");
    const {username,password} = req.body;
    const role = "doctor"
    const user  =  await User.findOne({username});
    if(user) return res.status(400).send("User already exists");
    const hashedPassword = await bcrypt.hash(password,10);
    const users =  new User({username,password:hashedPassword,role});
    try{
        const savedUser =  await users.save();
        res.send(savedUser);
    }
    catch(err){
        res.status(400).send(err);
    }
});

// router.get("/:gameId",auth, async(req,res)=>{

module.exports = router;
