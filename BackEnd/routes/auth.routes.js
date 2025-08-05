import { Router } from 'express';
import { register, login, facebookLogin, updateUserInfo, getUserInfo } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/facebook', facebookLogin);

// User routes (protected)
router.put('/user/:username', verifyToken, updateUserInfo);
router.get('/user/:username', verifyToken, getUserInfo);

export default router;