const express = require('express');
const Child = require('../models/child');
const User = require('../models/User');
const Games = require('../models/GameStatus');
const auth = require('../middleware/auth');
const Feedback = require('../models/Feedback');
const router = express.Router();

router.get('/:centreId/allchildren',auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).send('Access Denied');
    const { centreId } = req.params;
    try {
        const children = await Child.find({centreId:centreId});
        // const childetails = child.name;
        res.send(children);
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
module.exports = router;