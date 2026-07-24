const express = require('express');
const router = express.Router();
const { getMedicines, getMedicine, createMedicine, updateMedicine, deleteMedicine, getLowStockCount } = require('../controllers/medicineController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/low-stock-count', getLowStockCount);
router.route('/').get(getMedicines).post(createMedicine);
router.route('/:id').get(getMedicine).put(updateMedicine).delete(deleteMedicine);

module.exports = router;
