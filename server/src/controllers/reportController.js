const MedicalReport = require('../models/MedicalReport');
const { extractTextFromFile } = require('../services/ocrService');
const { analyzeReport } = require('../services/aiService');

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

    if (req.file) {
      fileUrl = `/uploads/reports/${req.file.filename}`;
      fileName = req.file.originalname;
      try {
        ocrText = await extractTextFromFile(req.file.path);
        const analysis = analyzeReport(ocrText);
        aiSummary = analysis.summary;
        importantFindings = analysis.findings;
        abnormalValues = analysis.abnormalValues;
      } catch (err) {
        console.error('OCR/AI error:', err.message);
        ocrText = 'Processing failed';
        aiSummary = 'Unable to analyze report at this time.';
      }
    }

    const report = await MedicalReport.create({
      patient,
      ashaWorker: req.user._id,
      reportName,
      reportType,
      reportDate,
      fileUrl,
      fileName,
      ocrText,
      aiSummary,
      importantFindings,
      abnormalValues,
      processingStatus: 'completed',
    });

    res.status(201).json({ success: true, message: 'Report uploaded and analyzed', data: report });
  } catch (error) {
    next(error);
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
