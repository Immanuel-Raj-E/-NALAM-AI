const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    ashaWorker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['Medicine', 'Appointment', 'Vaccination', 'Follow-up', 'Other'], required: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, trim: true },
    reminderDate: { type: Date, required: true },
    reminderTime: { type: String },
    isCompleted: { type: Boolean, default: false },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reminder', reminderSchema);
