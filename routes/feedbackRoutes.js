const express = require('express');
const Feedback = require('../models/Feedback');
const router = express.Router();
const auth = require('../middleware/auth');

// Feedback
router.post('/', auth, async (req, res) => {

    if (!(req.user.role === 'caretaker' || req.user.role === 'doctor')) return res.status(403).send('Access Denied');
    
    const { role, username, feedback } = req.body;
    const feedbacks = new Feedback({ role, username, feedback });
    try {
        const savedFeedback = await feedbacks.save();
        res.send(savedFeedback);
    } catch (err) {
        res.status(400).send(err);
    }
});

module.exports = router;