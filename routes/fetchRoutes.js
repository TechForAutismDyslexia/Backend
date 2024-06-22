const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Child = require('../models/child');
const Game = require('../models/GameStatus');
const router = express.Router();
const auth = require('../middleware/auth');

//get caretaker names from the database
router.get('/:caretakername',auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).send('Access Denied');
    const { caretakername } = req.params;
    try {
        const caretakers = await User.find({role: 'caretaker', name:caretakername});
        res.send(caretakers);
    } catch (err) {
        res.status(400).send(err);
    }
});
router.get('/:doctorname',auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).send('Access Denied');
    const { doctorname } = req.params;
    try {
        const doctors = await User.find({role: 'doctor', name:doctorname});
        res.send(doctors);
    } catch (err) {
        res.status(400).send(err);
    }
});
module.exports = router;