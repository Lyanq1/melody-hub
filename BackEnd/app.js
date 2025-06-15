import express from 'express'
import cors from 'cors'
const app = express()

import authRoutes from './routes/auth.routes.js'
import artistRoutes from './routes/artist.routes.js'
import customerRoutes from './routes/customer.routes.js'
import adminRoutes from './routes/admin.routes.js'
// Cấu hình CORS
app.use(
  cors({
    origin: ['http://localhost:3000', 'https://localhost:3000', 'https://680f-14-169-250-93.ngrok-free.app'],
    credentials: true // Cho phép gửi cookie nếu cần
  })
)

app.use(express.json())

// Các route của bạn
app.use('/api/auth', authRoutes)
app.use('/api/artist', artistRoutes)
app.use('/api/customer', customerRoutes)
app.use('/api/admin', adminRoutes)

export default app
