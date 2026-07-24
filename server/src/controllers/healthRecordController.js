const HealthRecord = require('../models/HealthRecord');
const Patient = require('../models/Patient');

const getHealthRecords = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const records = await HealthRecord.find({ patient: patientId, ashaWorker: req.user._id })
      .sort({ visitDate: -1 });
    res.json({ success: true, count: records.length, data: records });
  } catch (error) {
    next(error);
  }
};

const getHealthRecord = async (req, res, next) => {
  try {
    const record = await HealthRecord.findById(req.params.id).populate('patient', 'name age gender');
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

const createHealthRecord = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const record = await HealthRecord.create({ ...req.body, patient: patientId, ashaWorker: req.user._id });
    // Update patient's last visit date
    await Patient.findByIdAndUpdate(patientId, { lastVisitDate: new Date() });
    res.status(201).json({ success: true, message: 'Health record added', data: record });
  } catch (error) {
    next(error);
  }
};

const updateHealthRecord = async (req, res, next) => {
  try {
    const record = await HealthRecord.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, message: 'Record updated', data: record });
  } catch (error) {
    next(error);
  }
};

const deleteHealthRecord = async (req, res, next) => {
  try {
    await HealthRecord.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Record deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getHealthRecords, getHealthRecord, createHealthRecord, updateHealthRecord, deleteHealthRecord };
