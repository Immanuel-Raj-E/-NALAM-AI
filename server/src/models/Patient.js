const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    ashaWorker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: [true, 'Patient name is required'], trim: true },
    age: { type: Number, required: [true, 'Age is required'], min: 0, max: 150 },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    village: { type: String, trim: true },
    district: { type: String, trim: true },
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'], default: 'Unknown' },
    medicalConditions: [{ type: String }],
    allergies: [{ type: String }],
    riskLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
    pregnancyStatus: { type: String, enum: ['Not Applicable', 'Pregnant', 'Postpartum'], default: 'Not Applicable' },
    lastVisitDate: { type: Date },
    nextVisitDate: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Text index for search
patientSchema.index({ name: 'text', village: 'text', phone: 'text' });

module.exports = mongoose.model('Patient', patientSchema);
