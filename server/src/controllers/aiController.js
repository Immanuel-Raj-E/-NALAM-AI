const { checkSymptoms, predictDisease, generateChatResponse, generateAIPrescription } = require('../services/aiService');

// @desc    AI Symptom Checker
// @route   POST /api/ai/symptom-check
const symptomCheck = async (req, res, next) => {
  try {
    const { symptoms, patientAge, patientGender } = req.body;
    if (!symptoms || !symptoms.length) {
      return res.status(400).json({ success: false, message: 'Please provide symptoms' });
    }
    const result = checkSymptoms(symptoms, patientAge, patientGender);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc    Disease Prediction
// @route   POST /api/ai/predict-disease
const predictDiseaseController = async (req, res, next) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms || !symptoms.length) {
      return res.status(400).json({ success: false, message: 'Please provide symptoms' });
    }
    const result = predictDisease(symptoms);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc    Chat with AI assistant
// @route   POST /api/ai/chat
const chat = async (req, res, next) => {
  try {
    const { message } = req.body;
    const response = generateChatResponse(message);
    res.json({ success: true, data: response });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate AI Prescription
// @route   POST /api/ai/generate-prescription
const generatePrescriptionController = async (req, res, next) => {
  try {
    const { patientName, patientAge, patientGender, symptoms, diagnosis } = req.body;
    const result = generateAIPrescription({ patientName, patientAge, patientGender, symptoms, diagnosis });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = { symptomCheck, predictDiseaseController, chat, generatePrescriptionController };
