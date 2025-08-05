import { Router } from 'express';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.get('/', (req, res) => { /* Get all products */ });
router.get('/:id', (req, res) => { /* Get single product */ });
router.get('/category/:categoryId', (req, res) => { /* Get products by category */ });

// Protected routes (Admin only)
router.post('/', verifyToken, isAdmin, (req, res) => { /* Create product */ });
router.put('/:id', verifyToken, isAdmin, (req, res) => { /* Update product */ });
router.delete('/:id', verifyToken, isAdmin, (req, res) => { /* Delete product */ });

export default router;