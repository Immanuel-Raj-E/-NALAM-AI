const express = require('express');
const router = express.Router();
const { getHealthRecords, getHealthRecord, createHealthRecord, updateHealthRecord, deleteHealthRecord } = require('../controllers/healthRecordController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/patient/:patientId').get(getHealthRecords).post(createHealthRecord);
router.route('/:id').get(getHealthRecord).put(updateHealthRecord).delete(deleteHealthRecord);

module.exports = router;
