const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['caretaker', 'parent', 'doctor', 'admin'] },
    name: { type: String, required: true },
    mobilenumber: { type: Number, required: true },
    email: { type: String, required: true },

});
module.exports = mongoose.models.Parent || mongoose.model('User', userSchema);