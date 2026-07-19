import mongoose from 'mongoose';

// Mongoose connection helper. Called from index.js at boot.
const connectDB = async (uri) => {
  mongoose.set('strictQuery', true);
  const conn = await mongoose.connect(uri);
  console.log(`MongoDB connected: ${conn.connection.host}`);
  return conn;
};

export default connectDB;
