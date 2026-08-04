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
const Prescription = require('../models/Prescription');
const MedicalReport = require('../models/MedicalReport');

const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ MongoDB Connected for seeding...');
  } catch (error) {
    console.log(`⚠️ Atlas connection failed: ${error.message}. Seeding to local MongoDB...`);
    await mongoose.connect('mongodb://localhost:27017/nalam_ai');
    console.log('✅ Local MongoDB Connected for seeding...');
  }
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
    Prescription.deleteMany({}),
    MedicalReport.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing database collections');

  // Create System Admin
  await User.create({
    name: 'System Admin (Nalam)',
    email: 'admin@nalamhealth.in',
    password: 'admin123',
    role: 'admin',
    phone: '9998887770',
    village: 'Krishnagiri HQ',
    district: 'Krishnagiri',
    state: 'Tamil Nadu',
  });
  console.log('System Admin created');

  // Create ASHA Worker
  const ashaWorker = await User.create({
    name: 'Meena Kumari',
    email: 'meena@nalamhealth.in',
    password: 'asha1234',
    role: 'asha_worker',
    ashaWorkerId: 'ASHA-101',
    phone: '9876543210',
    village: 'Mathur',
    district: 'Krishnagiri',
    state: 'Tamil Nadu',
  });
  console.log('ASHA Worker created');

  // Create Patient Accounts for Login
  await User.create([
    {
      name: 'Lakshmi Devi',
      email: 'lakshmi@nalamhealth.in',
      password: 'patient123',
      role: 'patient',
      phone: '6374306286',
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
    { name: 'Lakshmi Devi', age: 28, gender: 'Female', phone: '6374306286', address: '12, Main Street', village: 'Mathur', district: 'Krishnagiri', bloodGroup: 'O+', medicalConditions: ['Anaemia', 'Pregnancy'], allergies: ['Penicillin'], riskLevel: 'High', pregnancyStatus: 'Pregnant', lastVisitDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
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

  // Create Health Records
  await HealthRecord.create([
    {
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
    },
    {
      patient: patients[1]._id,
      ashaWorker: ashaWorker._id,
      visitDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      chiefComplaint: 'Headache, frequent thirst',
      symptoms: ['Headache', 'Thirst', 'Blurred Vision'],
      diagnosis: 'Uncontrolled Type 2 Diabetes and Stage 1 Hypertension',
      medicines: [{ name: 'Metformin 500mg', dosage: '1 tablet', duration: '30 days', frequency: 'Twice daily' }, { name: 'Amlodipine 5mg', dosage: '1 tablet', duration: '30 days', frequency: 'Once daily' }],
      doctorNotes: 'Fasting Blood Sugar 185 mg/dL. BP 145/95 mmHg. Referred to Salem GH Cardiology.',
      bloodPressure: '145/95',
      temperature: '98.4°F',
      weight: '74 kg',
      followUpDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    },
    {
      patient: patients[2]._id,
      ashaWorker: ashaWorker._id,
      visitDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      chiefComplaint: 'Breathlessness on exertion',
      symptoms: ['Shortness of Breath', 'Wheezing', 'Dry Cough'],
      diagnosis: 'Bronchial Asthma Acute Exacerbation',
      medicines: [{ name: 'Salbutamol Inhaler', dosage: '2 puffs', duration: 'As needed', frequency: 'SOS' }],
      doctorNotes: 'Chest clear. Prescribed Inhaler usage guidance provided by ASHA worker.',
      bloodPressure: '120/80',
      temperature: '98.6°F',
      weight: '58 kg',
      followUpDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    },
    {
      patient: patients[3]._id,
      ashaWorker: ashaWorker._id,
      visitDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      chiefComplaint: 'Growth monitoring & general checkup',
      symptoms: ['Underweight', 'Loss of Appetite'],
      diagnosis: 'Mild Pediatric Malnutrition',
      medicines: [{ name: 'Vitamin D3 Drops', dosage: '5 drops', duration: '30 days', frequency: 'Once daily' }],
      doctorNotes: 'Child is active but slightly underweight for age. Prescribed vitamin supplements and advised nutritious diet chart.',
      bloodPressure: '90/60',
      temperature: '98.2°F',
      weight: '22 kg',
      followUpDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
    {
      patient: patients[7]._id,
      ashaWorker: ashaWorker._id,
      visitDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      chiefComplaint: 'Severe cough and breathing distress',
      symptoms: ['Chronic Cough', 'Dyspnoea', 'Fatigue'],
      diagnosis: 'Chronic Obstructive Pulmonary Disease (COPD) Exacerbation',
      medicines: [{ name: 'Salbutamol Inhaler', dosage: '2 puffs', duration: '30 days', frequency: 'Three times daily' }],
      doctorNotes: 'Patient has long smoking history. Advice on smoking cessation and correct inhaler technique given.',
      bloodPressure: '135/85',
      temperature: '98.5°F',
      weight: '60 kg',
      followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      patient: patients[9]._id,
      ashaWorker: ashaWorker._id,
      visitDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      chiefComplaint: 'Persistent evening fever and hemoptysis',
      symptoms: ['Fever', 'Cough with blood', 'Weight loss'],
      diagnosis: 'Pulmonary Tuberculosis (Active)',
      medicines: [{ name: 'Amoxicillin 250mg', dosage: '1 capsule', duration: '7 days', frequency: 'Thrice daily' }],
      doctorNotes: 'Initiating DOTS Regimen immediately. Weekly weight monitoring required.',
      bloodPressure: '110/70',
      temperature: '100.2°F',
      weight: '48 kg',
      followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }
  ]);
  console.log('🩺 Health Records created');

  // Create Prescriptions
  await Prescription.create([
    {
      patient: patients[0]._id,
      ashaWorker: ashaWorker._id,
      doctorName: 'Dr. Meena Devi',
      hospitalName: 'PHC Mathur',
      prescriptionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      notes: '1. Tab IFA (Iron Folic Acid) 1 OD after food. 2. Tab Calcium 500mg 1 BD after meals. 3. Hydrate well.',
      ocrText: 'PHC MATHUR ANC PRESCRIPTION\nPatient: Lakshmi Devi (28Y/F)\nRx:\n1. Tab Iron + Folic Acid 1 OD x 180 days\n2. Tab Calcium 500mg 1 BD x 180 days\nSd/- Dr. Meena Devi, M.D. (Obstetrics)',
    },
    {
      patient: patients[1]._id,
      ashaWorker: ashaWorker._id,
      doctorName: 'Dr. Arun Prakash',
      hospitalName: 'Salem Government Hospital',
      prescriptionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      notes: '1. Tab Metformin 500mg BD after meals. 2. Tab Amlodipine 5mg OD morning. 3. Low salt & low sugar diet.',
      ocrText: 'SALEM GOVERNMENT HOSPITAL - CARDIOLOGY\nPatient: Ramu Selvam (52Y/M)\nRx:\n1. Tab Metformin 500mg 1-0-1\n2. Tab Amlodipine 5mg 1-0-0\nSd/- Dr. Arun Prakash',
    },
    {
      patient: patients[9]._id,
      ashaWorker: ashaWorker._id,
      doctorName: 'Dr. Priya Rajan',
      hospitalName: 'Krishnagiri Government Hospital',
      prescriptionDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      notes: 'DOTS Regimen Category 1: 4FDC (Rifampicin, Isoniazid, Pyrazinamide, Ethambutol) daily under ASHA supervision.',
      ocrText: 'KRISHNAGIRI GH - RNTCP TB CLINIC\nPatient: Senthil Pandi (38Y/M)\nRegimen: Category 1 DOTS 4FDC 3 tablets daily under ASHA surveillance.',
    },
    {
      patient: patients[2]._id,
      ashaWorker: ashaWorker._id,
      doctorName: 'Dr. Priya Rajan',
      hospitalName: 'Krishnagiri Government Hospital',
      prescriptionDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      notes: 'Salbutamol Inhaler 2 puffs SOS for asthma exacerbation. Avoid dust and cold allergens.',
      ocrText: 'KRISHNAGIRI GH - OUTPATIENT SERVICES\nPatient: Kavitha Raj (35Y/F)\nRx:\n1. Salbutamol Inhaler 100mcg - 2 puffs SOS\nSd/- Dr. Priya Rajan',
    },
    {
      patient: patients[3]._id,
      ashaWorker: ashaWorker._id,
      doctorName: 'Dr. Meena Devi',
      hospitalName: 'PHC Mathur',
      prescriptionDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      notes: 'Multivitamin Syrup 5ml once daily after breakfast. Focus on dietary protein and milk.',
      ocrText: 'PHC MATHUR - PEDIATRICS\nPatient: Arjun Kumar (8Y/M)\nRx:\n1. Syrup Multivitamin 1 bottle - 5ml OD\nSd/- Dr. Meena Devi',
    },
    {
      patient: patients[7]._id,
      ashaWorker: ashaWorker._id,
      doctorName: 'Dr. Rajesh Babu',
      hospitalName: 'Krishnagiri Government Hospital',
      prescriptionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      notes: 'Salbutamol Inhaler 2 puffs TDS (three times daily) for COPD. Tab Paracetamol 500mg 1 tablet SOS for headache.',
      ocrText: 'KRISHNAGIRI GOVERNMENT HOSPITAL\nPatient: Gopal Naidu (70Y/M)\nRx:\n1. Salbutamol Inhaler - 2 puffs TDS\n2. Tab Paracetamol 500mg - 1 SOS\nSd/- Dr. Rajesh Babu',
    }
  ]);
  console.log('📋 Prescriptions created');

  // Create Medical Reports
  await MedicalReport.create([
    {
      patient: patients[0]._id,
      ashaWorker: ashaWorker._id,
      reportName: 'Complete Blood Count (CBC) & ANC Profile',
      reportType: 'Blood Test',
      reportDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      ocrText: 'KRISHNAGIRI DIAGNOSTIC LAB\nPATIENT: Lakshmi Devi (28/F)\nHaemoglobin: 9.8 g/dL (Normal: 12.0 - 15.5)\nRBC Count: 3.8 million/mcL (Normal: 4.2 - 5.4)\nWBC Count: 7,500 /mcL (Normal: 4,500 - 11,000)\nPlatelets: 240,000 /mcL (Normal: 150,000 - 450,000)\nBlood Group: O Positive\nVDRL / HIV: Negative',
      abnormalValues: [
        { parameter: 'Haemoglobin', value: '9.8 g/dL', normalRange: '12.0 - 15.5', status: 'Low' },
        { parameter: 'RBC Count', value: '3.8 million/mcL', normalRange: '4.2 - 5.4', status: 'Low' }
      ],
      aiSummary: 'Patient presents with mild nutritional anaemia (Hb 9.8 g/dL). Blood group confirmed O Positive. Infectious screening negative.',
      importantFindings: ['Mild Anaemia (Hb 9.8 g/dL)', 'Requires daily Iron & Folic Acid supplementation']
    },
    {
      patient: patients[1]._id,
      ashaWorker: ashaWorker._id,
      reportName: 'Fasting Blood Sugar & Lipid Profile',
      reportType: 'Blood Test',
      reportDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      ocrText: 'VEPPANAPALLI PHC LAB\nPATIENT: Ramu Selvam (52/M)\nFasting Blood Sugar: 185 mg/dL (Normal: 70 - 100)\nPost Prandial Glucose: 260 mg/dL (Normal: < 140)\nHbA1c: 8.9% (Normal: < 5.7%)\nSerum Creatinine: 1.1 mg/dL (Normal: 0.7 - 1.3)',
      abnormalValues: [
        { parameter: 'Fasting Blood Sugar', value: '185 mg/dL', normalRange: '70 - 100', status: 'High' },
        { parameter: 'Post Prandial Glucose', value: '260 mg/dL', normalRange: '< 140', status: 'High' },
        { parameter: 'HbA1c', value: '8.9%', normalRange: '< 5.7%', status: 'High' }
      ],
      aiSummary: 'Significantly elevated glucose parameters indicating uncontrolled Type 2 Diabetes (HbA1c 8.9%). Kidney function normal.',
      importantFindings: ['Uncontrolled Type 2 Diabetes (HbA1c 8.9%)', 'Strict dietary regulation & regular anti-diabetic medication required']
    },
    {
      patient: patients[7]._id,
      ashaWorker: ashaWorker._id,
      reportName: 'Lipid Profile Report',
      reportType: 'Blood Test',
      reportDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      ocrText: 'KRISHNAGIRI GOVERNMENT PHC LAB\nPATIENT: Gopal Naidu (70/M)\nTotal Cholesterol: 245 mg/dL (Normal: < 200)\nTriglycerides: 190 mg/dL (Normal: < 150)\nHDL Cholesterol: 38 mg/dL (Normal: > 40)\nLDL Cholesterol: 169 mg/dL (Normal: < 100)',
      abnormalValues: [
        { parameter: 'Total Cholesterol', value: '245 mg/dL', normalRange: '< 200', status: 'High' },
        { parameter: 'Triglycerides', value: '190 mg/dL', normalRange: '< 150', status: 'High' },
        { parameter: 'LDL Cholesterol', value: '169 mg/dL', normalRange: '< 100', status: 'High' },
        { parameter: 'HDL Cholesterol', value: '38 mg/dL', normalRange: '> 40', status: 'Low' }
      ],
      aiSummary: 'Hyperlipidemia detected. LDL and Total Cholesterol are significantly elevated. Advised low fat diet and cardiovascular risk evaluation.',
      importantFindings: ['High LDL (Bad Cholesterol)', 'High risk for cardiovascular conditions']
    },
    {
      patient: patients[9]._id,
      ashaWorker: ashaWorker._id,
      reportName: 'Sputum Smear Microscopy for Acid Fast Bacilli (AFB)',
      reportType: 'Other',
      reportDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      ocrText: 'MATHUR PHC MICROBIOLOGY DEPT\nPATIENT: Senthil Pandi (38/M)\nSpecimen: Sputum (Morning sample)\nAFB Stain Result: Positive (2+)\nZ-N Staining: Acid Fast Bacilli observed under high-power field microscopy.',
      abnormalValues: [
        { parameter: 'AFB Stain Result', value: 'Positive (2+)', normalRange: 'Negative', status: 'High' }
      ],
      aiSummary: 'Sputum smear positive for AFB (2+). Confirms active Pulmonary Tuberculosis infection. RNTCP guidelines suggest starting DOTS regimen immediately.',
      importantFindings: ['Active TB infection confirmed', 'ASHA Worker must ensure DOTS medicine adherence monitoring']
    }
  ]);
  console.log('🔬 Medical Reports created');

  // Create appointments
  const appointmentsData = [
    { patient: patients[0]._id, doctorName: 'Dr. Meena Devi', doctorSpecialty: 'Gynecology & Obstetrics', hospitalName: 'PHC Mathur', appointmentDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), appointmentTime: '10:00 AM', reason: 'ANC Check-up', status: 'Scheduled', isReferral: false },
    { patient: patients[1]._id, doctorName: 'Dr. Arun Prakash', doctorSpecialty: 'Cardiology', hospitalName: 'Salem Government Hospital', appointmentDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), appointmentTime: '9:00 AM', reason: 'Hypertension Follow-up', status: 'Scheduled', isReferral: true },
    { patient: patients[2]._id, doctorName: 'Dr. Priya Rajan', doctorSpecialty: 'General Medicine', hospitalName: 'Krishnagiri Government Hospital', appointmentDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), appointmentTime: '11:00 AM', reason: 'Asthma Review', status: 'Scheduled', isReferral: false },
    { patient: patients[4]._id, doctorName: 'Dr. Rajesh Babu', doctorSpecialty: 'Orthopedics', hospitalName: 'Krishnagiri Government Hospital', appointmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), appointmentTime: '2:00 PM', reason: 'Arthritis Pain Management', status: 'Scheduled', isReferral: false },
    { patient: patients[9]._id, doctorName: 'Dr. Priya Rajan', doctorSpecialty: 'General Medicine', hospitalName: 'Krishnagiri Government Hospital', appointmentDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), appointmentTime: '9:30 AM', reason: 'TB Follow-up', status: 'Completed', isReferral: false },
    { patient: patients[0]._id, doctorName: 'Dr. Meena Devi', doctorSpecialty: 'Gynecology & Obstetrics', hospitalName: 'PHC Mathur', appointmentDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), appointmentTime: '10:00 AM', reason: 'Routine Antenatal Visit', status: 'Completed', isReferral: false },
    { patient: patients[3]._id, doctorName: 'Dr. Meena Devi', doctorSpecialty: 'Pediatrics / MO', hospitalName: 'PHC Mathur', appointmentDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), appointmentTime: '11:30 AM', reason: 'Nutrition & Growth Evaluation', status: 'Scheduled', isReferral: false },
    { patient: patients[7]._id, doctorName: 'Dr. Rajesh Babu', doctorSpecialty: 'General Medicine', hospitalName: 'Krishnagiri Government Hospital', appointmentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), appointmentTime: '11:00 AM', reason: 'COPD Inhaler Review', status: 'Scheduled', isReferral: false }
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
    { patient: patients[3]._id, vaccineName: 'OPV (Polio Drops)', vaccineType: 'Oral Attenuated', doseNumber: 3, scheduledDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), administeredDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), status: 'Completed', administeredBy: 'Meena Kumari', location: 'Mathur Village' },
    { patient: patients[3]._id, vaccineName: 'Pentavalent Vaccine', vaccineType: 'Combined', doseNumber: 3, scheduledDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), administeredDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), status: 'Completed', administeredBy: 'PHC Nurse', location: 'PHC Mathur' },
    { patient: patients[8]._id, vaccineName: 'Tetanus Toxoid (TT)', vaccineType: 'Toxoid', doseNumber: 1, scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), status: 'Pending' }
  ];

  await Vaccination.insertMany(vaccinationsData.map(v => ({ ...v, ashaWorker: ashaWorker._id })));
  console.log('💉 Vaccinations created');

  // Create reminders
  const remindersData = [
    { patient: patients[0]._id, type: 'Medicine', title: 'IFA Tablet - Lakshmi Devi', message: 'Ensure patient takes Iron Folic Acid daily', reminderDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), reminderTime: '9:00 AM', priority: 'High' },
    { patient: patients[1]._id, type: 'Appointment', title: 'Cardiology Appointment - Ramu', message: 'Patient appointment with Dr. Arun Prakash in 5 days', reminderDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), reminderTime: '8:00 AM', priority: 'High' },
    { patient: patients[3]._id, type: 'Vaccination', title: 'MMR Vaccine Due - Arjun', message: 'Child is overdue for MMR vaccine. Schedule immediately.', reminderDate: new Date(Date.now() + 0 * 24 * 60 * 60 * 1000), reminderTime: '10:00 AM', priority: 'High' },
    { patient: patients[9]._id, type: 'Follow-up', title: 'TB Follow-up - Senthil', message: 'Monthly DOTS follow-up visit required', reminderDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), reminderTime: '11:00 AM', priority: 'High' },
    { patient: patients[2]._id, type: 'Medicine', title: 'Asthma Inhaler Check - Kavitha', message: 'ASHA home visit to check correct inhaler usage compliance', reminderDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), reminderTime: '4:00 PM', priority: 'Medium' },
    { patient: patients[7]._id, type: 'Follow-up', title: 'COPD Spirometry - Gopal', message: 'Schedule breathing function test at district GH', reminderDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), reminderTime: '10:00 AM', priority: 'Medium' }
  ];

  await Reminder.insertMany(remindersData.map(r => ({ ...r, ashaWorker: ashaWorker._id })));
  console.log('🔔 Reminders created');

  console.log('\n🎉 ALL 9 COLLECTIONS SEEDED TO MONGODB ATLAS SUCCESSFULLY!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 ASHA Worker Email: meena@nalamhealth.in');
  console.log('🔑 ASHA Worker Password: asha1234');
  console.log('📧 Patient Email: lakshmi@nalamhealth.in');
  console.log('🔑 Patient Password: patient123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  process.exit(0);
};

seedData().catch(err => {
  console.error('❌ Seeding failed:', err.message);
  process.exit(1);
});
