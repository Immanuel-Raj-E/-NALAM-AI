const Appointment = require('../models/Appointment');

const getAppointments = async (req, res, next) => {
  try {
    const { status, upcoming, patientId } = req.query;
    const query = { ashaWorker: req.user._id };
    if (status) query.status = status;
    if (patientId) query.patient = patientId;
    if (upcoming === 'true') query.appointmentDate = { $gte: new Date() };

    const appointments = await Appointment.find(query)
      .populate('patient', 'name age village phone')
      .sort({ appointmentDate: 1 });
    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    next(error);
  }
};

const getAppointment = async (req, res, next) => {
  try {
    const appt = await Appointment.findById(req.params.id).populate('patient', 'name age gender village phone');
    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, data: appt });
  } catch (error) {
    next(error);
  }
};

const createAppointment = async (req, res, next) => {
  try {
    const appt = await Appointment.create({ ...req.body, ashaWorker: req.user._id });
    const populated = await appt.populate('patient', 'name age village phone');
    res.status(201).json({ success: true, message: 'Appointment booked', data: populated });
  } catch (error) {
    next(error);
  }
};

const updateAppointment = async (req, res, next) => {
  try {
    const appt = await Appointment.findOneAndUpdate(
      { _id: req.params.id, ashaWorker: req.user._id },
      req.body,
      { new: true }
    ).populate('patient', 'name age village phone');
    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, message: 'Appointment updated', data: appt });
  } catch (error) {
    next(error);
  }
};

const deleteAppointment = async (req, res, next) => {
  try {
    await Appointment.findOneAndDelete({ _id: req.params.id, ashaWorker: req.user._id });
    res.json({ success: true, message: 'Appointment cancelled' });
  } catch (error) {
    next(error);
  }
};

const getUpcomingCount = async (req, res, next) => {
  try {
    const count = await Appointment.countDocuments({
      ashaWorker: req.user._id,
      appointmentDate: { $gte: new Date() },
      status: 'Scheduled',
    });
    res.json({ success: true, data: { count } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAppointments, getAppointment, createAppointment, updateAppointment, deleteAppointment, getUpcomingCount };
