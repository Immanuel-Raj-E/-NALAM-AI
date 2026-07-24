const express = require('express');
const router = express.Router();
const { getPatients, getPatient, createPatient, updatePatient, deletePatient, getStats } = require('../controllers/patientController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/stats', getStats);
router.route('/').get(getPatients).post(createPatient);
router.route('/:id').get(getPatient).put(updatePatient).delete(deletePatient);

module.exports = router;
