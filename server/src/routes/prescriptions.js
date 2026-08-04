const express = require('express');
const router = express.Router();
const { getPrescriptions, getPrescription, createPrescription, deletePrescription, sendPrescriptionWhatsapp } = require('../controllers/prescriptionController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.route('/').get(getPrescriptions).post(upload.single('file'), createPrescription);
router.route('/:id').get(getPrescription).delete(deletePrescription);
router.post('/:id/send-whatsapp', sendPrescriptionWhatsapp);

module.exports = router;
