import app from './app.js'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '.env') })
import redisClient from './config/redis.js'
import config from './config/config.js';
dotenv.config()

const PORT = process.env.APP_PORT || 5000
const HOST = process.env.APP_HOST || 'localhost'

console.log('Starting server initialization...');
console.log('Checking environment variables:');
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Not Set');
console.log('- REDIS_URL:', process.env.REDIS_URL ? '✅ Set' : '❌ Not Set');

// Connect to MongoDB before starting the server
console.log('Attempting to connect to databases...');

try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB Connection Successful');

  // Check Redis connection
  if (!redisClient.isOpen) {
    console.log('⚠️ Redis connection is not open, attempting to reconnect...');
    await redisClient.connect();
  }
  console.log('✅ Redis Connection Verified');

  // Start the server after successful database connections
  app.listen(PORT, () => {
    
    console.log(`✅ Server running on http://${HOST}:${PORT}`);
    
  });

} catch (error) {
  console.error('\n❌ Database Connection Error');
  console.error('Error Details:', {
    message: error.message,
    stack: error.stack
  });
  
  if (error.message.includes('Redis')) {
    console.error('\n❌ Redis Connection Failed');
    
  }
  
  if (error.message.includes('MongoDB')) {
    console.error('\n❌ MongoDB Connection Failed');
    
  }
  
  process.exit(1);
}

