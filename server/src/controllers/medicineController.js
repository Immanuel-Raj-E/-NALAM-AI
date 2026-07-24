const Medicine = require('../models/Medicine');

const getMedicines = async (req, res, next) => {
  try {
    const { lowStock, search } = req.query;
    const query = { ashaWorker: req.user._id };
    if (search) query.name = new RegExp(search, 'i');

    let medicines = await Medicine.find(query).sort({ name: 1 });

    if (lowStock === 'true') {
      medicines = medicines.filter(m => m.quantity <= m.lowStockThreshold);
    }

    res.json({ success: true, count: medicines.length, data: medicines });
  } catch (error) {
    next(error);
  }
};

const getMedicine = async (req, res, next) => {
  try {
    const med = await Medicine.findOne({ _id: req.params.id, ashaWorker: req.user._id });
    if (!med) return res.status(404).json({ success: false, message: 'Medicine not found' });
    res.json({ success: true, data: med });
  } catch (error) {
    next(error);
  }
};

const createMedicine = async (req, res, next) => {
  try {
    const med = await Medicine.create({ ...req.body, ashaWorker: req.user._id });
    res.status(201).json({ success: true, message: 'Medicine added', data: med });
  } catch (error) {
    next(error);
  }
};

const updateMedicine = async (req, res, next) => {
  try {
    const med = await Medicine.findOneAndUpdate(
      { _id: req.params.id, ashaWorker: req.user._id },
      req.body,
      { new: true }
    );
    if (!med) return res.status(404).json({ success: false, message: 'Medicine not found' });

    // ==================== START n8n WEBHOOK INTEGRATION ====================
    if (med.quantity <= med.lowStockThreshold) {
      try {
        const webhookUrl = process.env.N8N_WEBHOOK_URL || 'https://immanuel123.app.n8n.cloud/webhook/low-stock-alert';
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            medicineName: med.name,
            availableQuantity: med.quantity,
            threshold: med.lowStockThreshold,
            unit: med.unit || 'Tablets',
            email: process.env.ALERT_EMAIL || 'imman8046@gmail.com'
          })
        });
        console.log(`📡 n8n Low Stock Webhook triggered for medicine: ${med.name}`);
      } catch (webhookErr) {
        console.error('⚠️ n8n Webhook Error (non-blocking):', webhookErr.message);
      }
    }
    // ===================== END n8n WEBHOOK INTEGRATION =====================

    res.json({ success: true, message: 'Medicine updated', data: med });
  } catch (error) {
    next(error);
  }
};

const deleteMedicine = async (req, res, next) => {
  try {
    await Medicine.findOneAndDelete({ _id: req.params.id, ashaWorker: req.user._id });
    res.json({ success: true, message: 'Medicine removed' });
  } catch (error) {
    next(error);
  }
};

const getLowStockCount = async (req, res, next) => {
  try {
    const medicines = await Medicine.find({ ashaWorker: req.user._id });
    const lowStock = medicines.filter(m => m.quantity <= m.lowStockThreshold);
    res.json({ success: true, data: { count: lowStock.length } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMedicines, getMedicine, createMedicine, updateMedicine, deleteMedicine, getLowStockCount };
