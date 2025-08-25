import express from 'express';
import { getOrderById, createOrder, getUserOrders, updateOrderStatus } from '../controllers/order.controller.js';

const router = express.Router();

router.get('/:id', getOrderById);
router.post('/create/:userId', createOrder); 
router.get('/user/:userId', getUserOrders);
router.put('/:orderId/status', updateOrderStatus);

export default router;