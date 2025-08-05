import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import routes from './routes/index.js';

const app = express();
// Cấu hình CORS
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'https://localhost:3000',
      'https://c789-14-169-250-93.ngrok-free.app/',
      'https://melodyhub1.vercel.app'
    ],
    credentials: true
  })
);

// Middleware
app.use(express.json());

// Mount all routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Debug endpoint
app.get('/debug/mongodb', (req, res) => {
  try {
    const connectionState = mongoose.connection.readyState;
    const stateMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    res.status(200).json({
      connectionState: stateMap[connectionState] || 'unknown',
      dbName: mongoose.connection.name,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      models: Object.keys(mongoose.models)
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error checking MongoDB connection',
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
    });
  }
});

export default app;