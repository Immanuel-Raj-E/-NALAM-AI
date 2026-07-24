const Prescription = require('../models/Prescription');
const { extractTextFromFile } = require('../services/ocrService');

const getPrescriptions = async (req, res, next) => {
  try {
    const { patientId } = req.query;
    const query = { ashaWorker: req.user._id };
    if (patientId) query.patient = patientId;
    const prescriptions = await Prescription.find(query)
      .populate('patient', 'name age village')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: prescriptions.length, data: prescriptions });
  } catch (error) {
    next(error);
  }
};

const getPrescription = async (req, res, next) => {
  try {
    const p = await Prescription.findById(req.params.id).populate('patient', 'name age gender');
    if (!p) return res.status(404).json({ success: false, message: 'Prescription not found' });
    res.json({ success: true, data: p });
  } catch (error) {
    next(error);
  }
};

const createPrescription = async (req, res, next) => {
  try {
    const { patient, doctorName, hospitalName, prescriptionDate, notes } = req.body;
    let fileUrl = null;
    let fileName = null;
    let ocrText = '';

    if (req.file) {
      fileUrl = `/uploads/prescriptions/${req.file.filename}`;
      fileName = req.file.originalname;
      try {
        ocrText = await extractTextFromFile(req.file.path);
      } catch (err) {
        console.error('OCR error:', err.message);
        ocrText = 'OCR processing failed';
      }
    }

    const prescription = await Prescription.create({
      patient,
      ashaWorker: req.user._id,
      doctorName,
      hospitalName,
      prescriptionDate,
      notes,
      fileUrl,
      fileName,
      ocrText,
    });

    res.status(201).json({ success: true, message: 'Prescription uploaded', data: prescription });
  } catch (error) {
    next(error);
  }
};

const deletePrescription = async (req, res, next) => {
  try {
    await Prescription.findOneAndDelete({ _id: req.params.id, ashaWorker: req.user._id });
    res.json({ success: true, message: 'Prescription deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPrescriptions, getPrescription, createPrescription, deletePrescription };
