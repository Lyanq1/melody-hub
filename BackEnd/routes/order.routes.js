import express from 'express';
import { getOrderById, createOrder, getUserOrders, updateOrderStatus } from '../controllers/order.controller.js';

const router = express.Router();

router.get('/:id', getOrderById); // /api/orders/:id
router.post('/create', createOrder); // /api/orders/create
router.get('/user/:userId', getUserOrders); // /api/orders/user/:userId
router.put('/:orderId/status', updateOrderStatus); // /api/orders/:orderId/status

export default router;
