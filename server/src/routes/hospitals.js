const express = require('express');
const router = express.Router();
const { getHospitals, getHospital } = require('../controllers/hospitalController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getHospitals);
router.get('/:id', getHospital);

module.exports = router;
