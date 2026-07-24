const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    isConnected = true;
    return;
  }
  const mongoUri = process.env.MONGO_URI || 'mongodb+srv://imman8046_db_user:immanuel123@cluster0.qdb0waq.mongodb.net/nalam_ai?retryWrites=true&w=majority';
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`⚠️ MongoDB Atlas connection error: ${error.message}`);
    try {
      const conn = await mongoose.connect('mongodb://localhost:27017/nalam_ai');
      isConnected = true;
      console.log(`✅ Local MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
      console.error(`❌ MongoDB Connection Error: ${err.message}`);
    }
  }
};

module.exports = connectDB;
