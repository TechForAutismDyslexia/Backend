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
    console.log(parent)
    const parentId = parent._id;
    const parentDetail = parent.name;
    console.log(parentDetail);
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
router.get('/childs', auth, async (req, res) => {
    if (req.user.role !== 'parent') return res.status(403).send('Access Denied');
    try {
      const children = await Child.find({ parentId: req.user._id });
      res.send(children);
    } catch (err) {
      res.status(400).send(err);
    }
  });

module.exports = router;