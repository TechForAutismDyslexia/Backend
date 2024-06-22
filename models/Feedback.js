const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const feedbackschema = new Schema({
    childId :{type :mongoose.Schema.Types.ObjectId, ref : 'Child',required: true},
    role : 'doctor',
    name : { type: String, required: true},
    feedback: { type: [String], default:[] }
})

module.exports = mongoose.models.Feedback || mongoose.model('Feedback', feedbackschema); 