import app from './app.js'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import config from './config/config.js';
dotenv.config()

const PORT = process.env.APP_PORT || 5000
const HOST = process.env.APP_HOST || 'localhost'

// Connect to MongoDB before starting the server
mongoose.connect(config.db.uri)
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Start the server after successful database connection
    app.listen(config.app.port, () => {
      console.log(`Server running in ${config.app.env} mode on http://${config.app.host}:${config.app.port}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });