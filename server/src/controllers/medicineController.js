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
