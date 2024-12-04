const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  doctorID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parentID: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'User',
    default: null
  },
  slots: [{
    date: {
      type: String,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    booked: {
      type: Boolean,
      default: false
    },
    appointmentID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    }
  }]
});

const Consultation = mongoose.model('Consultation', consultationSchema);

module.exports = Consultation;
