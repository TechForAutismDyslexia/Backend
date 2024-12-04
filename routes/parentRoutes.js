const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Child = require('../models/child');
const Game = require('../models/GameStatus');
const router = express.Router();
const auth = require('../middleware/auth');

// Add child information (Parent)
router.post('/childinfo', auth, async (req, res) => {
    if (req.user.role !== 'parent') return res.status(403).send('Access Denied');
    const { name, centreId, age } = req.body;
    const childs = await Child.findOne({ name, centreId, age });
    if (childs) return res.status(400).send('Child already exists');
    parent = await User.findById(req.user._id);
    const parentId = parent._id;
    const parentDetail = parent.name;
    const child = new Child({
      name,
      centreId,
      age,
      parentDetails: parentDetail,
      parentId
    });
  
    try {
      const savedChild = await child.save();
      res.send(savedChild);
    } catch (err) {
      res.status(400).send(err);
    }
  });

// Get all children for parent
router.get('/children', auth, async (req, res) => {
    if (req.user.role !== 'parent') return res.status(403).send('Access Denied');
    
    try {
      const children = await Child.find({ parentId: req.user._id });
      res.send(children);
    } catch (err) {
      res.status(400).send(err);
    }
  });

  router.get('/getConsultations', auth, async (req, res) => {
    const parentID = req.user._id;
    if (req.user.role !== 'parent') {
        return res.status(403).send('Access Denied');
    }

    try {
        
        const consultations = await Consultation.find({ parentID: parentID });
        if (!consultations.length) {
            return res.status(404).send('No consultations found for this parent on this date');
        }
        console.log(consultations);
        res.send(consultations);

    } catch (err) {
        console.error(err); // Log error for debugging
        res.status(400).send(err.message); // Send error message to the client
    }
});

module.exports = router;