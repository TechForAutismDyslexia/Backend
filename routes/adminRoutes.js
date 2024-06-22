const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Child = require('../models/child');
const Game = require('../models/GameStatus');
const router = express.Router();
const auth = require('../middleware/auth');

// Admin assigns doctor and caretaker
router.put('/:id/assign', auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).send('Access Denied');
  
    const { caretakerId, doctorId } = req.body;
  
    try {
      const child = await Child.findById(req.params.id);
      if (!child) return res.status(404).send('Child not found');
  
      child.caretakerId = caretakerId;
      child.doctorId = doctorId;
      child.adminStatus = true;
  
      const updatedChild = await child.save();
      res.send(updatedChild);
    } catch (err) {
      res.status(400).send(err);
    }
  });
  

// Register
router.post('/careTakerRegister',auth, async (req, res) => {
    if(req.user.role !== 'admin') return res.status(403).send("Access Denied");
    const { username, password, name, mobilenumber,email} = req.body;
    const role = 'caretaker';
    //check if user already exists
    const user = await User.findOne({username});
    if(user) return res.status(400).send('User already exists');
    const hashedPassword = await bcrypt.hash(password, 10)
    const users = new User({ username, password: hashedPassword, role,name,mobilenumber,email });
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
    const { username, password, name, mobilenumber,email} = req.body;
    const role = "doctor"
    const user  =  await User.findOne({username});
    if(user) return res.status(400).send("User already exists");
    const hashedPassword = await bcrypt.hash(password,10);
    const users = new User({ username, password: hashedPassword, role,name,mobilenumber,email });
    try{
        const savedUser =  await users.save();
        res.send(savedUser);
    }
    catch(err){
        res.status(400).send(err);
    }
});
//to retrive all children played that game
router.get("/:id", auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).send("Access Denied");
    
    const gamer = req.params.id;
    try{
        const games = await Game.find({gameId:gamer});
        console.log(games);
        //get child details from childid fetched from games
        fetchchildId = games.map((game) => game.childId);
        const children = await Child.find({_id:fetchchildId});
        console.log(children);
        res.send(children);
    }
    catch(err){
        res.status(400).send(err);
    }

});


module.exports = router;
