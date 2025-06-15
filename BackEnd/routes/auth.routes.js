import express from 'express'
import { register, login, facebookLogin } from '../controllers/auth.controller.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.post('/facebook', facebookLogin)
export default router
