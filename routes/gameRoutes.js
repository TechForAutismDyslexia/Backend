const express = require('express');
const Game = require('../models/GameStatus');
const Child = require('../models/child');
const auth = require('../middleware/auth');
const router = express.Router();

// Create or Update game for a child
router.put('/:childId', auth, async (req, res) => {
  if (req.user.role !== 'caretaker') return res.status(403).send('Access Denied');
  const { gameId, tries, timer,status} = req.body;
  const { childId } = req.params;

  // Validate childId
  if (!childId) return res.status(400).send('Child ID is required');

  try {
    // Verify that the child is assigned to the caretaker
    const child = await Child.findById(childId);
    if (!child) return res.status(404).send('Child not found');
    if (req.user.role !== 'caretaker' || child.caretakerId.toString() !== req.user._id.toString()) {
      return res.status(403).send('Access Denied');
    }

    // Create or update a game entry
    let game = await Game.findOne({ gameId, childId });
    if (!game) {
      game = new Game({ gameId, childId, tries, timer, status });
    } else {
      game.tries = tries;
      game.timer = timer;
      game.status = status;
    }

    await game.save();

    // If the game status is completed, update the corresponding game status in the child's document
    if (status) {
      // Add the gameId to the gamesCompleted array if it's not already there
      if (!child.gamesCompleted.includes(gameId)) {
        child.gamesCompleted.push(gameId);
        await child.save();
      }
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

module.exports = router;
