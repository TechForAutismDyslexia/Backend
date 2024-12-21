const { type } = require('express/lib/response');
const mongoose = require('mongoose');

const IEPDoctorSchema = new mongoose.Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    childId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Child',
        required: true
    },
    therapy: {
        type: String,
        required: true
    },
    therapistName: {
        type: String,
        ref: 'User',
        required: true
    },
    monthlyGoals: [{
        month: {
            type: String,
            required: true
        },
        target: {
            type: String,
            required: true
        },
        goals: [{
            type: String,
            required: true
        }],
        performance:[{
            type : Number,
            default : 0
        }],
        therapistFeedback: {
            type: String,
            default : ''
        },
        doctorFeedback : {
            type : String,
            default : ''
        }
    }],
    selectedMonths : {
        type: [String],
        required: true
    },
    feedback: {
        type: String
    },
    startingMonth: {
        type: String,
        required: true
    },
    startingYear: {
        type: Number,
        required: true
    },
    selectedMonthsNames: {
        type: [String],
        required: true
    }
});

module.exports = mongoose.models.IEPDoctor || mongoose.model('IEPDoctor', IEPDoctorSchema);