import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import authRoutes from './routes/auth.routes.js'
import artistRoutes from './routes/artist.routes.js'
import customerRoutes from './routes/customer.routes.js'
import adminRoutes from './routes/admin.routes.js'
import discRoutes from './routes/disc.route.js'
import cartRoutes from './routes/cart.routes.js'
import categoryRoutes from './routes/category.routes.js'
import paymentRoutes from './routes/payment.route.js'

const app = express()

// Cấu hình CORS
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'https://localhost:3000',
      'https://c789-14-169-250-93.ngrok-free.app/',
      'https://melodyhub1.vercel.app'
    ],
    credentials: true // Cho phép gửi cookie nếu cần
  })
)

app.use(express.json())

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/artist', artistRoutes)
app.use('/api/customer', customerRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/product', discRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/payment', paymentRoutes)

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  })
})

// Debug endpoint to check MongoDB connection
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

export default app
