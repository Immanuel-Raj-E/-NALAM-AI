const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    ashaWorker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorName: { type: String, required: true, trim: true },
    doctorSpecialty: { type: String, trim: true },
    hospitalName: { type: String, trim: true },
    appointmentDate: { type: Date, required: true },
    appointmentTime: { type: String },
    reason: { type: String, trim: true },
    status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'], default: 'Scheduled' },
    notes: { type: String, trim: true },
    isReferral: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
