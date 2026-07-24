const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    ashaWorker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    visitDate: { type: Date, default: Date.now },
    chiefComplaint: { type: String, trim: true },
    symptoms: [{ type: String }],
    diagnosis: { type: String, trim: true },
    medicines: [
      {
        name: String,
        dosage: String,
        duration: String,
        frequency: String,
      },
    ],
    doctorNotes: { type: String, trim: true },
    bloodPressure: { type: String },
    temperature: { type: String },
    weight: { type: String },
    height: { type: String },
    referredTo: { type: String },
    followUpDate: { type: Date },
    attachments: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
