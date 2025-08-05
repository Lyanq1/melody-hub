import dotenv from 'dotenv'
import mongoose from 'mongoose';

dotenv.config()

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Atlas connected!'))
.catch((err) => console.error('MongoDB connection error:', err));

export default mongoose