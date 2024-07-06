const mongoose = require('mongoose');
const express = require('express');
const UserFeedback = require('../models/UserFeedback');
const router = express.router();


router.post('/', async (req, res) => {
    const { name, email, mobilenumber, feedback } = req.body;
    const userfeedback = new UserFeedback({ name, email, mobilenumber, feedback });
    try {
        const savedFeedback = await userfeedback.save();
        res.send(savedFeedback);
    } catch (err) {
        res.status(400).send(err);
    }
});
module.exports = router;    