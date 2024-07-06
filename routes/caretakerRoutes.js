const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Child = require('../models/child');
const Game = require('../models/GameStatus');
const router = express.Router();
const auth = require('../middleware/auth');
const Gametrial = require('../models/Gametrial');
// Get assigned children for caretaker
router.get('/assigned', auth, async (req, res) => {
    if (req.user.role !== 'caretaker') return res.status(403).send('Access Denied');

    try { 
        const children = await Child.find({ caretakerId: req.user._id });
        res.send(children);
    } catch (err) {
        res.status(400).send(err);
    }
});

// Create or Update game for a child
router.put('/:gameId/:childId', auth, async (req, res) => {
    if (req.user.role !== 'caretaker') return res.status(403).send('Access Denied');
    const { tries, timer, status } = req.body;
    const { gameId, childId } = req.params;

    // Validate childId
    if (!childId) return res.status(400).send('Child ID is required');

    try {
        // Verify that the child is assigned to the caretaker
        const child = await Child.findById(childId);
        if (!child) return res.status(404).send('Child not found');
        if (child.caretakerId.toString() !== req.user._id.toString()) {
            return res.status(403).send('Different caretaker assigned to the child');
        }

        // Create a new game entry regardless of whether one already exists
        const game = new Game({ gameId, childId, tries, timer, status });
        await game.save();

        // If the game status is completed, update the corresponding game status in the child's document
        if (status) {
            // Always add the gameId to the gamesCompleted array
            child.gamesCompleted.push(gameId);
            await child.save();
        } else {
            // Remove the gameId from the gamesCompleted array if the game is not completed
            const index = child.gamesCompleted.indexOf(gameId);
            if (index > -1) {
                child.gamesCompleted.splice(index, 1);
                await child.save();
            }
        }

        res.send(game);
    } catch (err) {
        res.status(400).send(err);
    }
});

router.post('/sendgamedata',async (req,res)=>{
    const {gameId,tries,timer,status,childId} = req.body;
    try{
        const game = new Gametrial({gameId,tries,timer,status});
        await game.save();
        res.status(200).send("Game data saved succesfully");
    }catch(err){
        res.status(400).send(err);
    }
});

router.put('/feedback/:childId', auth, async (req, res) => {
    if (req.user.role !== 'caretaker') return res.status(403).send('Access Denied');
    const { childId } = req.params;
    const { feedback } = req.body;
    const role = 'caretaker';
    if (!childId) return res.status(400).send('Child ID is required');
    try {
        const caretaker = await User.findById(req.user._id);
        if (!caretaker) return res.status(404).send('Caretaker not found');
        const name = caretaker.name;
        let feedbackDoc = await Feedback.findOne({ childId });
        if (!feedbackDoc) {
            feedbackDoc = new Feedback({ childId, name, role, feedback: [feedback] });
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