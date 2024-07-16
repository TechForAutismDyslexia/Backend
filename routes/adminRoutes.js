const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Child = require('../models/child');
const Centre = require('../models/Centre');
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
router.post('/careTakerRegister', auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).send("Access Denied");
    const { username, password, name, mobilenumber, email } = req.body;
    const role = 'caretaker';
    //check if user already exists
    const user = await User.findOne({ username });
    if (user) return res.status(400).send('User already exists');
    const hashedPassword = await bcrypt.hash(password, 10)
    const users = new User({ username, password: hashedPassword, role, name, mobilenumber, email });
    try {
        const savedUser = await users.save();
        res.send(savedUser);
    }
    catch (err) {
        res.status(400).send(err);
    }
});

// Register Doctor
router.post("/doctorRegister", auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).send("Access Denied");
    const { username, password, name, mobilenumber, email } = req.body;
    const role = "doctor"
    const user = await User.findOne({ username });
    if (user) return res.status(400).send("User already exists");
    const hashedPassword = await bcrypt.hash(password, 10);
    const users = new User({ username, password: hashedPassword, role, name, mobilenumber, email });
    try {
        const savedUser = await users.save();
        res.send(savedUser);
    }
    catch (err) {
        res.status(400).send(err);
    }
});

//to retrive all children played that game
router.get("/gamedetails/:gameid", auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).send("Access Denied");
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
    }
    catch (err) {
        res.status(400).send(err);
    }

});
router.get('/gametable/:childId', auth, async (req, res) => {
    const childId = req.params.childId;
    try {
        const games = await Game.find({ childId: childId });
        res.send(games);
    }
    catch (err) {
        res.status(400).send(err);
    }
});

module.exports = router;
