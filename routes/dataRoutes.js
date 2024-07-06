const express = require('express');
const Child = require('../models/child');
const User = require('../models/User');
const Games = require('../models/GameStatus');
const auth = require('../middleware/auth');
const Feedback = require('../models/Feedback');
const Centre = require('../models/Centre');
const Gameinfo = require('../models/Gameinfo');
const router = express.Router();

router.get('/allchildren',auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).send('Access Denied');
    console.log(req.user._id);
    const userdata = await User.findById(req.user._id);
    const Maincentre = userdata.username;
    const centre = await Centre.findOne({name:Maincentre});
    const Maincentreid = centre.centreId;
    try {
        const children = await Child.find({centreId:Maincentreid});
        res.send(children);
    } catch (err) {
        res.status(400).send(err);
    }
});

router.get('/allcentres',auth, async (req, res) => {
    try {
        const centres = await Centre.find();
        res.send(centres);
    } catch (err) {
        res.status(400).send(err);
    }
});

router.get("/alldoctors",auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).send('Access Denied');
    try {
        const doctors = await User.find({role: 'doctor'});
        res.send(doctors);
    } catch (err) {
        res.status(400).send(err);
    }
});
router.get("/allcaretakers",auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).send('Access Denied');
    try {
        const caretakers = await User.find({role: 'caretaker'});
        res.send(caretakers);
    } catch (err) {
        res.status(400).send(err);
    }
});
router.get('/allgames', async (req, res) => {
    try {
        const games = await Gameinfo.find();
        res.send(games);
    } catch (err) {
        res.status(400).send(err);
    }

});
router.get('/:childId/gamesplayed',auth, async (req, res) => {
    const { childId } = req.params;
    if (!childId) return res.status(400).send('Child ID is required');
    try {
        const games = await Games.find({childId});
        res.send(games);
    } catch (err) {
        res.status(400).send(err);
    }
});
//get feedback for that child
router.get('/feedback/:childId', auth, async (req, res) => {
    const {childId} = req.params;
    if (!childId) return res.status(400).send('Child ID is required');
    try {
        const feedbackDoc = await Feedback.findOne({ childId });
        if (!feedbackDoc) return res.status(404).send('Feedback not found');
        res.status(200).send(feedbackDoc);
    } catch (error) {
        res.status(500).send('Server error');
    }
});
//get details of the child
router.get('/child/:childId', auth, async (req, res) => {
    const {childId} = req.params;
    if (!childId) return res.status(400).send('Child ID is required');
    try {
        const child = await Child.findById(childId);
        if (!child) return res.status(404).send('Child not found');
        res.status(200).send(child);
    } catch (error) {
        res.status(500).send('Server error');
    }
});

module.exports = router;