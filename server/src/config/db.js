const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`⚠️ Atlas connection failed: ${error.message}. Falling back to local MongoDB...`);
    try {
      const conn = await mongoose.connect('mongodb://localhost:27017/nalam_ai');
      console.log(`✅ Local MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
      console.error(`❌ MongoDB Connection Error: ${err.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
