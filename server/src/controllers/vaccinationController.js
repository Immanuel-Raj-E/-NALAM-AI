const Vaccination = require('../models/Vaccination');

const getVaccinations = async (req, res, next) => {
  try {
    const { patientId, status } = req.query;
    const query = { ashaWorker: req.user._id };
    if (patientId) query.patient = patientId;
    if (status) query.status = status;
    const vaccinations = await Vaccination.find(query)
      .populate('patient', 'name age village')
      .sort({ scheduledDate: 1 });
    res.json({ success: true, count: vaccinations.length, data: vaccinations });
  } catch (error) {
    next(error);
  }
};

const createVaccination = async (req, res, next) => {
  try {
    const vacc = await Vaccination.create({ ...req.body, ashaWorker: req.user._id });
    const populated = await vacc.populate('patient', 'name age village');
    res.status(201).json({ success: true, message: 'Vaccination record added', data: populated });
  } catch (error) {
    next(error);
  }
};

const updateVaccination = async (req, res, next) => {
  try {
    const vacc = await Vaccination.findOneAndUpdate(
      { _id: req.params.id, ashaWorker: req.user._id },
      req.body,
      { new: true }
    ).populate('patient', 'name age village');
    if (!vacc) return res.status(404).json({ success: false, message: 'Vaccination record not found' });
    res.json({ success: true, message: 'Vaccination updated', data: vacc });
  } catch (error) {
    next(error);
  }
};

const deleteVaccination = async (req, res, next) => {
  try {
    await Vaccination.findOneAndDelete({ _id: req.params.id, ashaWorker: req.user._id });
    res.json({ success: true, message: 'Vaccination record deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getVaccinations, createVaccination, updateVaccination, deleteVaccination };
