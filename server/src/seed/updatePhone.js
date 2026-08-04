require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/nalam_ai';

const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const User = require('../models/User');

const updateDatabase = async () => {
  try {
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
      console.log('✅ Connected to MongoDB Atlas...');
    } catch (err) {
      console.log(`⚠️ Atlas connection failed: ${err.message}. Connecting to local MongoDB...`);
      await mongoose.connect('mongodb://localhost:27017/nalam_ai');
      console.log('✅ Local MongoDB Connected...');
    }

    // 1. Update Patient Lakshmi Devi
    const patientResult = await Patient.updateOne(
      { name: 'Lakshmi Devi' },
      { $set: { phone: '6374306286' } }
    );
    console.log(`Updated Patient document(s):`, patientResult);

    // 2. Update User Lakshmi Devi
    const userResult = await User.updateOne(
      { name: 'Lakshmi Devi', role: 'patient' },
      { $set: { phone: '6374306286' } }
    );
    console.log(`Updated User document(s):`, userResult);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to update database:', error);
    process.exit(1);
  }
};

updateDatabase();
