const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gameSchema = new Schema({
  gameId: { type: String, required: true },
  tries: { type: Number, required: true },
  timer: { type: Number, required: true },
  status: { type: Boolean, required: true },  // true for completed, false for not completed
  childId: { type: String, required: true }
});

module.exports = mongoose.model('Temp', gameSchema);
