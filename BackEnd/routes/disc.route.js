import express from 'express';
import { getAllDiscs, getDiscById } from '../controllers/disc.controller.js';

const router = express.Router();
router.get('/', getAllDiscs);
router.get('/:id', getDiscById);

export default router;