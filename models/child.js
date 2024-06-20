const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const childSchema = new Schema({
  name: { type: String, required: true },
  caretakerId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  doctorId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  centreId: { type: String, required: true },
  parentDetails: { type: String, ref: 'User', required: true },
  parentId : { type: Schema.Types.ObjectId, required: true },
  age: { type: Number, required: true },
  gamesCompleted: { type: [Boolean], default: [false,false,false,false,false] },
  adminStatus: { type: Boolean, default: false }
});

module.exports = mongoose.models.Child || mongoose.model('Child', childSchema);
