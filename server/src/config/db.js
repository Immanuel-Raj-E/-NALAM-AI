const mongoose = require('mongoose');

const mongoUri = process.env.MONGO_URI || 'mongodb+srv://imman8046_db_user:immanuel123@cluster0.qdb0waq.mongodb.net/nalam_ai?retryWrites=true&w=majority';

let cachedConn = null;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (cachedConn) {
    return cachedConn;
  }

  try {
    const opts = {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    };

    cachedConn = await mongoose.connect(mongoUri, opts);
    console.log(`✅ MongoDB Atlas Connected: ${cachedConn.connection.host}`);
    return cachedConn;
  } catch (error) {
    console.error(`⚠️ MongoDB Atlas Connection Error: ${error.message}`);
    
    // Only attempt localhost fallback if not running on Vercel
    if (!process.env.VERCEL) {
      try {
        cachedConn = await mongoose.connect('mongodb://localhost:27017/nalam_ai');
        console.log(`✅ Local MongoDB Connected: ${cachedConn.connection.host}`);
        return cachedConn;
      } catch (localErr) {
        console.error(`❌ Local MongoDB Connection Error: ${localErr.message}`);
      }
    }
    throw error;
  }
};

module.exports = connectDB;
