import express from 'express';
import { verifyToken, canManageSystem } from '../../middleware/auth.middleware.js';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  changeUserRole,
  getSystemStats,
  searchUsers,
  // Product Management
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteMultipleProducts,
  // Category Management
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  // Statistics
  getProductStats
} from '../../controllers/admin.controller.js';

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

// ==================== PRODUCT MANAGEMENT ====================
router.get('/products', getAllProducts);
router.get('/products/:productId', getProductById);
router.post('/products', createProduct);
router.put('/products/:productId', updateProduct);
router.delete('/products/:productId', deleteProduct);
router.delete('/products/bulk', deleteMultipleProducts);

// ==================== CATEGORY MANAGEMENT ====================
router.get('/categories', getAllCategories);
router.get('/categories/:categoryId', getCategoryById);
router.post('/categories', createCategory);
router.put('/categories/:categoryId', updateCategory);
router.delete('/categories/:categoryId', deleteCategory);

// ==================== PRODUCT STATISTICS ====================
router.get('/product-stats', getProductStats);

export default router;
