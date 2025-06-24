import app from './app.js'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const PORT = process.env.APP_PORT || 5000
const HOST = process.env.APP_HOST || 'localhost'

// Connect to MongoDB before starting the server
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB')
    
    // Start the server after successful database connection
    app.listen(PORT, () => {
      console.log(`Server running on http://${HOST}:${PORT}`)
    })
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err.message)
    process.exit(1)
  })

