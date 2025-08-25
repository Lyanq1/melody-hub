import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  changeUserRole,
  getSystemStats,
  searchUsers,
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteMultipleProducts,
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getProductStats,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
  getComprehensiveStats,
  getRevenueStats,
  getCustomerStats
} from '../../controllers/admin.controller.js';
import { verifyToken, canManageSystem } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Apply middleware to all routes
router.use(verifyToken, canManageSystem);

// User management routes
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserById);
router.put('/users/:userId', updateUser);
router.delete('/users/:userId', deleteUser);
router.patch('/users/:userId/role', changeUserRole);
router.get('/system-stats', getSystemStats);
router.get('/users/search', searchUsers);

// Product management routes
router.get('/products', getAllProducts);
router.get('/products/:productId', getProductById);
router.post('/products', createProduct);
router.put('/products/:productId', updateProduct);
router.delete('/products/:productId', deleteProduct);
router.delete('/products/bulk', deleteMultipleProducts);

// Category management routes
router.get('/categories', getAllCategories);
router.get('/categories/:categoryId', getCategoryById);
router.post('/categories', createCategory);
router.put('/categories/:categoryId', updateCategory);
router.delete('/categories/:categoryId', deleteCategory);

// Product statistics
router.get('/product-stats', getProductStats);

// Order management routes
router.get('/orders', getAllOrders);
router.get('/orders/:orderId', getOrderById);
router.patch('/orders/:orderId/status', updateOrderStatus);
router.patch('/orders/:orderId/payment', updatePaymentStatus);
router.delete('/orders/:orderId', deleteOrder);

// Comprehensive statistics routes
router.get('/stats/comprehensive', getComprehensiveStats);
router.get('/stats/revenue', getRevenueStats);
router.get('/stats/customers', getCustomerStats);

export default router;
