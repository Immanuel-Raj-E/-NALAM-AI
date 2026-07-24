const express = require('express');
const router = express.Router();
const { symptomCheck, predictDiseaseController, chat, generatePrescriptionController } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/symptom-check', symptomCheck);
router.post('/predict-disease', predictDiseaseController);
router.post('/chat', chat);
router.post('/generate-prescription', generatePrescriptionController);

module.exports = router;
