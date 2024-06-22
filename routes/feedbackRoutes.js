const express = require('express');
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const router = express.Router();
const auth = require('../middleware/auth');

// Feedback
router.put('/feedback/:childId', auth, async (req, res) => {
    if (req.user.role !== 'doctor') return res.status(403).send('Access Denied');
    const {childId} = req.params;
    const {feedback} = req.body;
    try {
        const doctor = await User.findById(req.user._id);
        if (!doctor) return res.status(404).send('Doctor not found');
        const name = doctor.name;
        let feedbackDoc = await Feedback.findOne({ childId });
        if (!feedbackDoc) {
            feedbackDoc = new Feedback({ childId, name, feedback: [feedback] });
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