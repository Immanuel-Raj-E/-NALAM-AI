const express = require('express');
const router = express.Router();
const { getDoctors } = require('../controllers/doctorController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getDoctors);

module.exports = router;
