require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/nalam_ai';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Medicine = require('../models/Medicine');
const Vaccination = require('../models/Vaccination');
const Reminder = require('../models/Reminder');
const HealthRecord = require('../models/HealthRecord');

const connectDB = async () => {
  await mongoose.connect(mongoUri);
  console.log('✅ MongoDB Connected for seeding...');
};

const seedData = async () => {
  await connectDB();

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Patient.deleteMany({}),
    Appointment.deleteMany({}),
    Medicine.deleteMany({}),
    Vaccination.deleteMany({}),
    Reminder.deleteMany({}),
    HealthRecord.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');

  // Create ASHA Worker
  const ashaWorker = await User.create({
    name: 'Meena Kumari',
    email: 'meena@nalamhealth.in',
    password: 'asha1234',
    role: 'asha_worker',
    phone: '9876543210',
    village: 'Mathur',
    district: 'Krishnagiri',
    state: 'Tamil Nadu',
  });
  console.log('👩 ASHA Worker created');

  // Create Patient Accounts for Login
  await User.create([
    {
      name: 'Lakshmi Devi',
      email: 'lakshmi@nalamhealth.in',
      password: 'patient123',
      role: 'patient',
      phone: '9876501001',
      village: 'Mathur',
      district: 'Krishnagiri',
      state: 'Tamil Nadu',
    },
    {
      name: 'Ramu Selvam',
      email: 'ramu@nalamhealth.in',
      password: 'patient123',
      role: 'patient',
      phone: '9876501002',
      village: 'Veppanapalli',
      district: 'Krishnagiri',
      state: 'Tamil Nadu',
    }
  ]);
  console.log('🧑‍🤝‍🧑 Patient Login Accounts created');

  // Create sample patients
  const patientsData = [
    { name: 'Lakshmi Devi', age: 28, gender: 'Female', phone: '9876501001', address: '12, Main Street', village: 'Mathur', district: 'Krishnagiri', bloodGroup: 'O+', medicalConditions: ['Anaemia', 'Pregnancy'], allergies: ['Penicillin'], riskLevel: 'High', pregnancyStatus: 'Pregnant', lastVisitDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    { name: 'Ramu Selvam', age: 52, gender: 'Male', phone: '9876501002', address: '45, Cross Street', village: 'Veppanapalli', district: 'Krishnagiri', bloodGroup: 'B+', medicalConditions: ['Hypertension', 'Diabetes'], allergies: [], riskLevel: 'High', lastVisitDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    { name: 'Kavitha Raj', age: 35, gender: 'Female', phone: '9876501003', address: '78, Temple Road', village: 'Bargur', district: 'Krishnagiri', bloodGroup: 'A+', medicalConditions: ['Asthma'], allergies: ['Aspirin'], riskLevel: 'Medium', lastVisitDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
    { name: 'Arjun Kumar', age: 8, gender: 'Male', phone: '9876501004', address: '23, North Street', village: 'Mathur', district: 'Krishnagiri', bloodGroup: 'AB+', medicalConditions: ['Malnutrition'], allergies: [], riskLevel: 'Medium', lastVisitDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    { name: 'Selvi Murugan', age: 65, gender: 'Female', phone: '9876501005', address: '5, South Street', village: 'Hosur', district: 'Krishnagiri', bloodGroup: 'O-', medicalConditions: ['Arthritis', 'Hypertension'], allergies: ['Sulfa drugs'], riskLevel: 'High', lastVisitDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    { name: 'Muthu Krishnan', age: 42, gender: 'Male', phone: '9876501006', address: '89, West Road', village: 'Bargur', district: 'Krishnagiri', bloodGroup: 'B-', medicalConditions: ['Diabetes'], allergies: [], riskLevel: 'Medium', lastVisitDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
    { name: 'Priya Sundaram', age: 23, gender: 'Female', phone: '9876501007', address: '34, East Colony', village: 'Mathur', district: 'Krishnagiri', bloodGroup: 'A-', medicalConditions: [], allergies: [], riskLevel: 'Low', lastVisitDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    { name: 'Gopal Naidu', age: 70, gender: 'Male', phone: '9876501008', address: '67, Old Town', village: 'Veppanapalli', district: 'Krishnagiri', bloodGroup: 'Unknown', medicalConditions: ['COPD', 'Hypertension', 'Diabetes'], allergies: ['Codeine'], riskLevel: 'High', lastVisitDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    { name: 'Rani Annamalai', age: 19, gender: 'Female', phone: '9876501009', address: '11, New Colony', village: 'Mathur', district: 'Krishnagiri', bloodGroup: 'O+', medicalConditions: ['Anaemia'], allergies: [], riskLevel: 'Low', lastVisitDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
    { name: 'Senthil Pandi', age: 38, gender: 'Male', phone: '9876501010', address: '56, Market Street', village: 'Bargur', district: 'Krishnagiri', bloodGroup: 'B+', medicalConditions: ['Tuberculosis'], allergies: [], riskLevel: 'High', lastVisitDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
  ];

  const patients = await Patient.insertMany(
    patientsData.map(p => ({ ...p, ashaWorker: ashaWorker._id }))
  );
  console.log(`👥 ${patients.length} Patients created`);

  // Create health records for first patient
  await HealthRecord.create({
    patient: patients[0]._id,
    ashaWorker: ashaWorker._id,
    visitDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    chiefComplaint: 'Morning sickness, fatigue',
    symptoms: ['Nausea', 'Fatigue', 'Dizziness'],
    diagnosis: 'First trimester pregnancy symptoms with mild anaemia',
    medicines: [{ name: 'Iron Folic Acid', dosage: '1 tablet', duration: '6 months', frequency: 'Once daily' }, { name: 'Calcium', dosage: '500mg', duration: '6 months', frequency: 'Twice daily' }],
    doctorNotes: 'Patient is 12 weeks pregnant. Haemoglobin 9.8 g/dL. Start IFA immediately. Next ANC visit in 4 weeks.',
    bloodPressure: '110/70',
    temperature: '98.6°F',
    weight: '52 kg',
    followUpDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
  });

  // Create appointments
  const appointmentsData = [
    { patient: patients[0]._id, doctorName: 'Dr. Meena Devi', doctorSpecialty: 'Gynecology & Obstetrics', hospitalName: 'PHC Mathur', appointmentDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), appointmentTime: '10:00 AM', reason: 'ANC Check-up', status: 'Scheduled', isReferral: false },
    { patient: patients[1]._id, doctorName: 'Dr. Arun Prakash', doctorSpecialty: 'Cardiology', hospitalName: 'Salem Government Hospital', appointmentDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), appointmentTime: '9:00 AM', reason: 'Hypertension Follow-up', status: 'Scheduled', isReferral: true },
    { patient: patients[2]._id, doctorName: 'Dr. Priya Rajan', doctorSpecialty: 'General Medicine', hospitalName: 'Krishnagiri Government Hospital', appointmentDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), appointmentTime: '11:00 AM', reason: 'Asthma Review', status: 'Scheduled', isReferral: false },
    { patient: patients[4]._id, doctorName: 'Dr. Rajesh Babu', doctorSpecialty: 'Orthopedics', hospitalName: 'Krishnagiri Government Hospital', appointmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), appointmentTime: '2:00 PM', reason: 'Arthritis Pain Management', status: 'Scheduled', isReferral: false },
    { patient: patients[9]._id, doctorName: 'Dr. Priya Rajan', doctorSpecialty: 'General Medicine', hospitalName: 'Krishnagiri Government Hospital', appointmentDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), appointmentTime: '9:30 AM', reason: 'TB Follow-up', status: 'Completed', isReferral: false },
  ];

  await Appointment.insertMany(appointmentsData.map(a => ({ ...a, ashaWorker: ashaWorker._id })));
  console.log('📅 Appointments created');

  // Create medicines
  const medicinesData = [
    { name: 'Paracetamol 500mg', genericName: 'Acetaminophen', category: 'Analgesic/Antipyretic', quantity: 150, unit: 'Tablets', lowStockThreshold: 20, expiryDate: new Date('2026-06-30') },
    { name: 'Iron Folic Acid', genericName: 'Ferrous Sulphate + Folic Acid', category: 'Haematinics', quantity: 8, unit: 'Tablets', lowStockThreshold: 15, expiryDate: new Date('2025-12-31') },
    { name: 'ORS Sachets', genericName: 'Oral Rehydration Salts', category: 'Electrolytes', quantity: 5, unit: 'Sachets', lowStockThreshold: 10, expiryDate: new Date('2026-03-31') },
    { name: 'Amoxicillin 250mg', genericName: 'Amoxicillin', category: 'Antibiotic', quantity: 60, unit: 'Capsules', lowStockThreshold: 10, expiryDate: new Date('2026-01-31') },
    { name: 'Metformin 500mg', genericName: 'Metformin HCl', category: 'Antidiabetic', quantity: 200, unit: 'Tablets', lowStockThreshold: 30, expiryDate: new Date('2026-09-30') },
    { name: 'Amlodipine 5mg', genericName: 'Amlodipine Besylate', category: 'Antihypertensive', quantity: 90, unit: 'Tablets', lowStockThreshold: 20, expiryDate: new Date('2026-08-31') },
    { name: 'Albendazole 400mg', genericName: 'Albendazole', category: 'Anthelmintic', quantity: 3, unit: 'Tablets', lowStockThreshold: 5, expiryDate: new Date('2026-04-30') },
    { name: 'Salbutamol Inhaler', genericName: 'Salbutamol Sulphate', category: 'Bronchodilator', quantity: 4, unit: 'Inhalers', lowStockThreshold: 2, expiryDate: new Date('2025-11-30') },
    { name: 'Vitamin D3 Drops', genericName: 'Cholecalciferol', category: 'Vitamin', quantity: 12, unit: 'Bottles', lowStockThreshold: 3, expiryDate: new Date('2026-02-28') },
    { name: 'Clotrimazole Cream', genericName: 'Clotrimazole', category: 'Antifungal', quantity: 15, unit: 'Tubes', lowStockThreshold: 5, expiryDate: new Date('2026-07-31') },
  ];

  await Medicine.insertMany(medicinesData.map(m => ({ ...m, ashaWorker: ashaWorker._id })));
  console.log('💊 Medicines created');

  // Create vaccinations
  const vaccinationsData = [
    { patient: patients[0]._id, vaccineName: 'Tetanus Toxoid (TT)', vaccineType: 'Toxoid', doseNumber: 1, scheduledDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), administeredDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), status: 'Completed', administeredBy: 'Meena Kumari', location: 'PHC Mathur' },
    { patient: patients[0]._id, vaccineName: 'Tetanus Toxoid (TT)', vaccineType: 'Toxoid', doseNumber: 2, scheduledDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), status: 'Pending' },
    { patient: patients[3]._id, vaccineName: 'BCG', vaccineType: 'Live Attenuated', doseNumber: 1, scheduledDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), administeredDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), status: 'Completed', administeredBy: 'PHC Staff', location: 'PHC Mathur' },
    { patient: patients[3]._id, vaccineName: 'MMR', vaccineType: 'Live Attenuated', doseNumber: 1, scheduledDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), status: 'Overdue' },
    { patient: patients[6]._id, vaccineName: 'COVID-19 Booster', vaccineType: 'mRNA', doseNumber: 3, scheduledDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), status: 'Pending' },
  ];

  await Vaccination.insertMany(vaccinationsData.map(v => ({ ...v, ashaWorker: ashaWorker._id })));
  console.log('💉 Vaccinations created');

  // Create reminders
  const remindersData = [
    { patient: patients[0]._id, type: 'Medicine', title: 'IFA Tablet - Lakshmi Devi', message: 'Ensure patient takes Iron Folic Acid daily', reminderDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), reminderTime: '9:00 AM', priority: 'High' },
    { patient: patients[1]._id, type: 'Appointment', title: 'Cardiology Appointment - Ramu', message: 'Patient appointment with Dr. Arun Prakash in 5 days', reminderDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), reminderTime: '8:00 AM', priority: 'High' },
    { patient: patients[3]._id, type: 'Vaccination', title: 'MMR Vaccine Due - Arjun', message: 'Child is overdue for MMR vaccine. Schedule immediately.', reminderDate: new Date(Date.now() + 0 * 24 * 60 * 60 * 1000), reminderTime: '10:00 AM', priority: 'High' },
    { patient: patients[9]._id, type: 'Follow-up', title: 'TB Follow-up - Senthil', message: 'Monthly DOTS follow-up visit required', reminderDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), reminderTime: '11:00 AM', priority: 'High' },
  ];

  await Reminder.insertMany(remindersData.map(r => ({ ...r, ashaWorker: ashaWorker._id })));
  console.log('🔔 Reminders created');

  console.log('\n🎉 Database seeded successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 Login Email: meena@nalamhealth.in');
  console.log('🔑 Password: asha1234');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  process.exit(0);
};

seedData().catch(err => {
  console.error('❌ Seeding failed:', err.message);
  process.exit(1);
});
