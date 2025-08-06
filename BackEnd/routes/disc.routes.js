import express from 'express';
import { getAllDiscs, getDiscById, clearCache } from '../controllers/disc.controller.js';

const router = express.Router();
router.get('/', getAllDiscs);
router.get('/:id', getDiscById);
router.delete('/cache', clearCache);
export default router;