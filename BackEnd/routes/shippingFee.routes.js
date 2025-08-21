import express from 'express';
import {
  getFeeByDistrict,
  getAllFees,
  updateFee,
  deleteFee
} from '../controllers/shippingFee.controller.js';

const router = express.Router();

// Get shipping fee for a specific district
router.get('/:district', getFeeByDistrict);

// Get all shipping fees
router.get('/', getAllFees);

// Update shipping fee for a district
router.put('/:district', updateFee);

// Delete shipping fee for a district
router.delete('/:district', deleteFee);

export default router;
