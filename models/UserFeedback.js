const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Userfeedbackschema = new Schema({
    name: { type: String, required: true },
    email : { type: String, required: true },
    mobilenumber : { type: Number, required: true },
    feedback: { type: String, required: true }
})
module.exports = mongoose.models.UserFeedback || mongoose.model('UserFeedback', Userfeedbackschema);