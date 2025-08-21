import express from 'express';
import {
  getDeliveryFee,
  getAllDeliveryFees
} from '../controllers/deliveryFee.controller.js';

const router = express.Router();

// Get delivery fee for a specific district
router.get('/:toDistrict', getDeliveryFee);

// Get all delivery fees
router.get('/', getAllDeliveryFees);

export default router;