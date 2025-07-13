import express from 'express';
import { createPayment, momoCallback, verifyPayment } from '../controllers/momo.controller.js';

const router = express.Router();

router.post('/momo-payment', createPayment);
router.post('/momo/callback', momoCallback);
router.get('/momo/callback', momoCallback);
router.post('/momo/verify', verifyPayment);

export default router;