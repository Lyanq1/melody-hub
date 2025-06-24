import mongoose from 'mongoose'
import { env } from './environment.js'

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI || process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

export default connectDB;
