const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const feedbackschema = new Schema({
    role : { type: String, required: true, enum : ['caretaker', 'doctor']},
    username : { type: String, required: true},
    feedback: { type: String, required: true }
})

module.exports = mongoose.models.Feedback || mongoose.model('Feedback', feedbackschema); 