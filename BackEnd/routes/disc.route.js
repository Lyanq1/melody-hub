import express from 'express';
import { getAllDiscs } from '../controllers/disc.controller.js'; // Điều chỉnh đường dẫn

const router = express.Router();
router.get('/', getAllDiscs);


export default router;