const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userdataschema = new Schema({
    name: { type: String, required: true },
    mobilenumber: { type: String, required: true },
    role: { type: String, required: true, enum: ['caretaker', 'parent', 'doctor'] },
    userId : { type: Schema.Types.ObjectId, required: true },
    username : { type: String, required: true },
    status : { type: Boolean, required: true , default: false },
});
module.exports = mongoose.models.Userdata || mongoose.model('Userdata', userdataschema);