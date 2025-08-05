import { Router } from 'express';
import authRoutes from './auth.routes.js';
import adminRoutes from './admin.routes.js';
import discRoutes from './disc.routes.js';
import cartRoutes from './cart.routes.js';
import categoryRoutes from './category.routes.js';
import paymentRoutes from './payment.routes.js';
import orderRoutes from './order.routes.js';
import scrapeRoutes from './scrape.routes.js';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/product', discRoutes);
router.use('/cart', cartRoutes);
router.use('/categories', categoryRoutes);
router.use('/payment', paymentRoutes);
router.use('/orders', orderRoutes);
router.use('/scrape', scrapeRoutes);

export default router;