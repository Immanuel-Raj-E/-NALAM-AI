const Reminder = require('../models/Reminder');

const getReminders = async (req, res, next) => {
  try {
    const { patientId, upcoming } = req.query;
    const query = { ashaWorker: req.user._id, isCompleted: false };
    if (patientId) query.patient = patientId;
    if (upcoming === 'true') {
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      query.reminderDate = { $gte: today, $lte: nextWeek };
    }
    const reminders = await Reminder.find(query)
      .populate('patient', 'name village')
      .sort({ reminderDate: 1 });
    res.json({ success: true, count: reminders.length, data: reminders });
  } catch (error) {
    next(error);
  }
};

const createReminder = async (req, res, next) => {
  try {
    const reminder = await Reminder.create({ ...req.body, ashaWorker: req.user._id });
    const populated = await reminder.populate('patient', 'name village');
    res.status(201).json({ success: true, message: 'Reminder created', data: populated });
  } catch (error) {
    next(error);
  }
};

const updateReminder = async (req, res, next) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, ashaWorker: req.user._id },
      req.body,
      { new: true }
    );
    if (!reminder) return res.status(404).json({ success: false, message: 'Reminder not found' });
    res.json({ success: true, message: 'Reminder updated', data: reminder });
  } catch (error) {
    next(error);
  }
};

const deleteReminder = async (req, res, next) => {
  try {
    await Reminder.findOneAndDelete({ _id: req.params.id, ashaWorker: req.user._id });
    res.json({ success: true, message: 'Reminder deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getReminders, createReminder, updateReminder, deleteReminder };
