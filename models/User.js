const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['caretaker', 'prent', 'doctor', 'admin'] }
});

module.exports = mongoose.model.User || mongoose.model('User', userSchema);
