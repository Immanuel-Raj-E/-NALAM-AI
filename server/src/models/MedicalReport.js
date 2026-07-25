const mongoose = require('mongoose');

const medicalReportSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    ashaWorker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reportName: { type: String, trim: true },
    reportType: { type: String, enum: ['Blood Test', 'X-Ray', 'MRI', 'CT Scan', 'Urine Test', 'ECG', 'Other'], default: 'Other' },
    reportDate: { type: Date, default: Date.now },
    fileUrl: { type: String },
    fileName: { type: String },
    ocrText: { type: String },
    aiSummary: { type: String },
    importantFindings: [{ type: String }],
    abnormalValues: [
      {
        parameter: String,
        value: String,
        normalRange: String,
        status: { type: String, enum: ['High', 'Low', 'Normal'] },
      },
    ],
    ecgAnalysis: {
      classCode: String,
      className: String,
      confidence: Number,
      riskLevel: String,
      description: String,
      recommendation: String,
    },
    processingStatus: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MedicalReport', medicalReportSchema);
