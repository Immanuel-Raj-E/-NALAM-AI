const express = require('express');
const router = express.Router();
const { getReports, getReport, createReport, deleteReport } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.route('/').get(getReports).post(upload.single('file'), createReport);
router.route('/:id').get(getReport).delete(deleteReport);

module.exports = router;
