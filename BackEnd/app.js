import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.routes.js'
import artistRoutes from './routes/artist.routes.js'
import customerRoutes from './routes/customer.routes.js'
import adminRoutes from './routes/admin.routes.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/artist', artistRoutes)
app.use('/api/customer', customerRoutes)
app.use('/api/admin', adminRoutes)

export default app
