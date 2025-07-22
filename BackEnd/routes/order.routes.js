import express from 'express';
import { getOrderById } from '../controllers/order.controller.js';

const router = express.Router();

router.get('/:id', getOrderById); // /api/orders/:id

export default router;
