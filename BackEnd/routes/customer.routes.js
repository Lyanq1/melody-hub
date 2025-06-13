import express from 'express'
const router = express.Router()
import customerController from '../controllers/customer.controller.js'

// POST /api/customer/register
router.post('/register', customerController.register)

// POST /api/customer/login
router.post('/login', customerController.login)

export default router

// import express from 'express'
// import { getAllArtists } from '../controllers/artist.controller.js'

// const router = express.Router()

// router.get('/', getAllArtists)

// export default router
