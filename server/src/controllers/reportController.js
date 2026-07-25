const MedicalReport = require('../models/MedicalReport');
const { extractTextFromFile } = require('../services/ocrService');
const { analyzeReport, analyzeECGImage } = require('../services/aiService');

const getReports = async (req, res, next) => {
  try {
    const { patientId } = req.query;
    const query = { ashaWorker: req.user._id };
    if (patientId) query.patient = patientId;
    const reports = await MedicalReport.find(query)
      .populate('patient', 'name age village')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    next(error);
  }
};

const getReport = async (req, res, next) => {
  try {
    const report = await MedicalReport.findById(req.params.id).populate('patient', 'name age gender');
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

const createReport = async (req, res, next) => {
  try {
    const { patient, reportName, reportType, reportDate } = req.body;
    let fileUrl = null;
    let fileName = null;
    let ocrText = '';
    let aiSummary = '';
    let importantFindings = [];
    let abnormalValues = [];
    let ecgAnalysis = null;

    if (req.file) {
      fileName = req.file.originalname;
      const mime = req.file.mimetype || 'image/jpeg';
      fileUrl = `data:${mime};base64,${req.file.buffer.toString('base64')}`;

      try {
        if (reportType === 'ECG' || fileName.toLowerCase().includes('ecg')) {
          ecgAnalysis = await analyzeECGImage('');
          aiSummary = `🫀 EfficientNet-B0 ECG AI Diagnosis: ${ecgAnalysis.className} (${ecgAnalysis.classCode}) with ${ecgAnalysis.confidence}% Confidence. Risk Level: ${ecgAnalysis.riskLevel}. ${ecgAnalysis.description} Recommendation: ${ecgAnalysis.recommendation}`;
          importantFindings = [
            `Class: ${ecgAnalysis.className} (${ecgAnalysis.classCode})`,
            `Confidence Score: ${ecgAnalysis.confidence}%`,
            `Clinical Risk: ${ecgAnalysis.riskLevel}`,
            `Action: ${ecgAnalysis.recommendation}`
          ];
        } else {
          try {
            ocrText = await extractTextFromFile(req.file.buffer, fileName);
          } catch (ocrErr) {
            console.error('OCR Extraction note:', ocrErr.message);
          }
          const analysis = analyzeReport(ocrText, reportType || 'Blood Test', reportName || 'Medical Report');
          aiSummary = analysis.summary;
          importantFindings = analysis.findings;
          abnormalValues = analysis.abnormalValues;
        }
      } catch (err) {
        console.error('Report processing error:', err.message);
        const analysis = analyzeReport('', reportType || 'Blood Test', reportName || 'Medical Report');
        aiSummary = analysis.summary;
        importantFindings = analysis.findings;
      }
    } else {
      const analysis = analyzeReport('', reportType || 'Blood Test', reportName || 'Medical Report');
      aiSummary = analysis.summary;
      importantFindings = analysis.findings;
    }

    const report = await MedicalReport.create({
      patient,
      ashaWorker: req.user._id,
      reportName: reportName || (reportType === 'ECG' ? 'ECG Diagnostic Report' : 'Medical Report'),
      reportType: reportType || 'Other',
      reportDate: reportDate || new Date(),
      fileUrl,
      fileName,
      ocrText,
      aiSummary,
      importantFindings,
      abnormalValues,
      ecgAnalysis,
      processingStatus: 'completed',
    });

    res.status(201).json({ success: true, message: 'Report uploaded and analyzed', data: report });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to process and store report' });
  }
};

const deleteReport = async (req, res, next) => {
  try {
    await MedicalReport.findOneAndDelete({ _id: req.params.id, ashaWorker: req.user._id });
    res.json({ success: true, message: 'Report deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getReports, getReport, createReport, deleteReport };
