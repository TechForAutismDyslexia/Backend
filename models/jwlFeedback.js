const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const jwlFeedback = new Schema({
    name: { type: String, required: true },
    email : { type: String, required: true },
    feedback: { type: String, required: true }
})
module.exports = mongoose.models.jwlUserFeedback || mongoose.model('jwlUserFeedback', jwlFeedback);