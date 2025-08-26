import { Router } from 'express';
import { register, login, facebookLogin, updateUserInfo, getUserInfo, checkDashboardAccess, getCurrentUser,
    requestPasswordReset, verifyResetCode, resetPassword, changePassword, googleSync
 } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/facebook', facebookLogin);
router.post('/google-sync', googleSync);

// User routes (protected)
router.put('/user/:username', verifyToken, updateUserInfo);
router.get('/user/:username', verifyToken, getUserInfo);

// Password reset routes
router.post('/forgot-password', requestPasswordReset);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);

// Change password route (protected)
router.put('/change-password/:username', verifyToken, changePassword);

// Dashboard access check (protected)
router.get('/dashboard/access', verifyToken, checkDashboardAccess);

// Get current user info (protected)
router.get('/me', verifyToken, getCurrentUser);

export default router;