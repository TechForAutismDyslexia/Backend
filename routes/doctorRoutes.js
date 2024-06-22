const express = require('express');
const Child = require('../models/child');
const User = require('../models/User');
const auth = require('../middleware/auth');
const Feedback = require('../models/Feedback');
const router = express.Router();


// Get assigned children and caretakers for doctor
router.get('/assigned', auth, async (req, res) => {
  if (req.user.role !== 'doctor') return res.status(403).send('Access Denied');

  try {
    const children = await Child.find({ doctorId: req.user._id }).populate('caretakerId');
    res.send(children);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Feedback
router.put('/feedback/:childId', auth, async (req, res) => {
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

module.exports = router;
