import express from 'express'
import { register, login, facebookLogin, updateUserInfo, getUserInfo } from '../controllers/auth.controller.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.post('/facebook', facebookLogin)
router.put('/user/:username', updateUserInfo)
router.get('/user/:username', getUserInfo)
export default router
