const Patient = require('../models/Patient');

// @desc    Get all patients for ASHA worker
// @route   GET /api/patients
const getPatients = async (req, res, next) => {
  try {
    const { search, riskLevel, village, page = 1, limit = 20 } = req.query;
    const query = req.user.role === 'patient' ? { isActive: true } : { ashaWorker: req.user._id, isActive: true };

    if (riskLevel) query.riskLevel = riskLevel;
    if (village) query.village = new RegExp(village, 'i');
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
        { village: new RegExp(search, 'i') },
      ];
    }

    const total = await Patient.countDocuments(query);
    const patients = await Patient.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: patients.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: patients,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single patient
// @route   GET /api/patients/:id
const getPatient = async (req, res, next) => {
  try {
    const query = req.user.role === 'patient' ? { _id: req.params.id } : { _id: req.params.id, ashaWorker: req.user._id };
    const patient = await Patient.findOne(query);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
    res.json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

// @desc    Create patient
// @route   POST /api/patients
const createPatient = async (req, res, next) => {
  try {
    const patient = await Patient.create({ ...req.body, ashaWorker: req.user._id });
    res.status(201).json({ success: true, message: 'Patient added successfully', data: patient });
  } catch (error) {
    next(error);
  }
};

// @desc    Update patient
// @route   PUT /api/patients/:id
const updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findOneAndUpdate(
      { _id: req.params.id, ashaWorker: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
    res.json({ success: true, message: 'Patient updated', data: patient });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete patient (soft delete)
// @route   DELETE /api/patients/:id
const deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findOneAndUpdate(
      { _id: req.params.id, ashaWorker: req.user._id },
      { isActive: false },
      { new: true }
    );
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
    res.json({ success: true, message: 'Patient removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats
// @route   GET /api/patients/stats
const getStats = async (req, res, next) => {
  try {
    const workerId = req.user._id;
    const [total, highRisk, medium] = await Promise.all([
      Patient.countDocuments({ ashaWorker: workerId, isActive: true }),
      Patient.countDocuments({ ashaWorker: workerId, isActive: true, riskLevel: 'High' }),
      Patient.countDocuments({ ashaWorker: workerId, isActive: true, riskLevel: 'Medium' }),
    ]);
    res.json({ success: true, data: { total, highRisk, medium, low: total - highRisk - medium } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPatients, getPatient, createPatient, updatePatient, deletePatient, getStats };
