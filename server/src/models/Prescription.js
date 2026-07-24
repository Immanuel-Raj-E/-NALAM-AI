const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    ashaWorker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorName: { type: String, trim: true },
    hospitalName: { type: String, trim: true },
    prescriptionDate: { type: Date, default: Date.now },
    fileUrl: { type: String },
    fileName: { type: String },
    ocrText: { type: String },
    extractedMedicines: [
      {
        name: String,
        dosage: String,
        duration: String,
      },
    ],
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);
