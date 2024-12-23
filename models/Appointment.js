const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AppointmentSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  parentName: {
    type: String,
    required: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  childName: {
    type: String,
    required: true
  },
  dob: {
    type: String,
    required: true
  },
  appointmentDate: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Others'],
    required: true
  },
  parentPhoneNo: {
    type: String,
    required: true
  },
  alternativeNumber: {
    type: String,
    required: false
  },
  address: {
    type: String,
    required: false
  },
  schoolName: {
    type: String,
    required: false
  },
  classGrade: {
    type: String,
    required: false
  },
  schoolBoard: {
    type: String,
    enum: ['CBSE', 'SSC', 'ICSE', 'Camebridge (IB)', 'NIOS', 'others'],
    required: false
  },
  consultationType: {
    type: String,
    enum: [
      'New Consultation',
      'Assessment(IQ)',
      'For IB board Assessment(IQ)'
    ],
    required: true
  },
  referredBy: {
    type: String,
  },
  childConcerns: {
    type: String,
    required: true
  },
  branch: {
    type: String,
    enum: [
      'Himayathnagar', 'Barkathpura', 'Champapet',
      'Nacharam'
    ],
    required: true
  },
  time: {
    type: String,
    enum: ['10:30 AM', '11:30 AM', '12:30 PM', '2:00 PM', '3:00 PM', '3:30 PM', '4:30 PM', '5:30 PM'],
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medicalReports: {
    type: String,
    required: false
  },
  prescription: {
    type:String,
    default:''
  },
  status: { type: String, enum: ['pending', 'confirmed', 'rejected'], default: 'pending' }
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
