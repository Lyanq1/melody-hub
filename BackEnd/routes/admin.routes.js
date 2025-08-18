import express from 'express';
import { verifyToken, canManageSystem } from '../middleware/auth.middleware.js';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  changeUserRole,
  getSystemStats,
  searchUsers
} from '../controllers/admin.controller.js';

const router = express.Router();

// Tất cả routes admin đều cần verify token và quyền admin
router.use(verifyToken);
router.use(canManageSystem);

// Quản lý người dùng
router.get('/users', getAllUsers);
router.get('/users/search', searchUsers);
router.get('/users/:userId', getUserById);
router.put('/users/:userId', updateUser);
router.delete('/users/:userId', deleteUser);
router.patch('/users/:userId/role', changeUserRole);

// Thống kê hệ thống
router.get('/stats', getSystemStats);

export default router;
