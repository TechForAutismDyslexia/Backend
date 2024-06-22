const express = require('express');
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const router = express.Router();
const auth = require('../middleware/auth');

// Feedback
router.put('/doctorfeedback/:childId', auth, async (req, res) => {
    if (req.user.role !== 'doctor') return res.status(403).send('Access Denied');
    const {childId} = req.params;
    const {feedback} = req.body;
    const role = 'doctor';
    if (!childId) return res.status(400).send('Child ID is required');
    try {
        const doctor = await User.findById(req.user._id);
        if (!doctor) return res.status(404).send('Doctor not found');
        const name = doctor.name;
        let feedbackDoc = await Feedback.findOne({ childId });
        if (!feedbackDoc) {
            feedbackDoc = new Feedback({ childId, name,role, feedback: [feedback] });
        } else {
            feedbackDoc.feedback.push(feedback);
        }
        await feedbackDoc.save();
        res.status(200).send(feedbackDoc);
    } catch (error) {
        res.status(500).send('Server error');
    }
});

router.put('/caretakerfeedback/:childId', auth, async (req, res) => {
    if (req.user.role !== 'caretaker') return res.status(403).send('Access Denied');
    const {childId} = req.params;
    const {feedback} = req.body;
    const role = 'caretaker';
    if (!childId) return res.status(400).send('Child ID is required');
    try {
        const caretaker = await User.findById(req.user._id);
        if (!caretaker) return res.status(404).send('Caretaker not found');
        const name = caretaker.name;
        let feedbackDoc = await Feedback.findOne({ childId });
        if (!feedbackDoc) {
            feedbackDoc = new Feedback({ childId, name,role, feedback: [feedback] });
        } else {
            feedbackDoc.feedback.push(feedback);
        }
        await feedbackDoc.save();
        res.status(200).send(feedbackDoc);
    } catch (error) {
        res.status(500).send('Server error');
    }
});

module.exports = router;