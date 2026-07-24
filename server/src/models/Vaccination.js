const mongoose = require('mongoose');

const vaccinationSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    ashaWorker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vaccineName: { type: String, required: true, trim: true },
    vaccineType: { type: String, trim: true },
    doseNumber: { type: Number, default: 1 },
    scheduledDate: { type: Date },
    administeredDate: { type: Date },
    status: { type: String, enum: ['Pending', 'Completed', 'Overdue', 'Skipped'], default: 'Pending' },
    administeredBy: { type: String, trim: true },
    location: { type: String, trim: true },
    batchNumber: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vaccination', vaccinationSchema);
