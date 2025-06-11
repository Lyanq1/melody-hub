import express from 'express'
import cors from 'cors'
import artistRoutes from './routes/artist.routes.js'
// import adminRoutes from './routes/admin.routes.js'
// import userRoutes from './routes/user.routes.js'
const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/artists', artistRoutes)

export default app
