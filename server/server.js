const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

// Route imports
const authRoutes = require('./src/routes/auth');
const patientRoutes = require('./src/routes/patients');
const healthRecordRoutes = require('./src/routes/healthRecords');
const prescriptionRoutes = require('./src/routes/prescriptions');
const reportRoutes = require('./src/routes/reports');
const appointmentRoutes = require('./src/routes/appointments');
const medicineRoutes = require('./src/routes/medicines');
const vaccinationRoutes = require('./src/routes/vaccinations');
const reminderRoutes = require('./src/routes/reminders');
const aiRoutes = require('./src/routes/ai');
const doctorRoutes = require('./src/routes/doctors');
const hospitalRoutes = require('./src/routes/hospitals');

const app = express();

// Connect to MongoDB
connectDB().catch(err => console.error('Initial DB Connect Note:', err.message));
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database middleware connect error:', err.message);
    res.status(500).json({ success: false, message: 'Database connection establishing. Please try signing in again.' });
  }
});

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS
app.use(cors({
  origin: true,
  credentials: true,
}));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/health-records', healthRecordRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/vaccinations', vaccinationRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/hospitals', hospitalRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'NALAM AI Server is running', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 NALAM AI Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  });
}

module.exports = app;
