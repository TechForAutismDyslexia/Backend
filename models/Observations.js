const mongoose = require('mongoose');
const child = require('./child');
const Schema = mongoose.Schema;

const ObservationSchema = new Schema({
    childId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Child',
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    observations:{
        type: String,
        required: true
    },
    recommendations:{
        type: String,
        required: true
    }
});

const Observations = mongoose.model('Observations', ObservationSchema);
