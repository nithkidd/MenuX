import { Router } from 'express';
import { verifyAuth } from '../shared/middleware/auth.middleware.js';

// Feature routes
import { businessRoutes } from '../features/business/index.js';
import { categoryRoutes } from '../features/category/index.js';
import { itemRoutes } from '../features/item/index.js';
import { menuRoutes } from '../features/menu/index.js';
import { uploadRoutes } from '../features/upload/index.js';
import authRoutes from '../features/auth/auth.routes.js';

const router = Router();

// Auth routes
router.use('/auth', authRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes (no auth required)
router.use('/menu', menuRoutes);

// Protected routes (auth required)
router.use('/business', verifyAuth, businessRoutes);
router.use(verifyAuth, categoryRoutes);  // Has /business/:id/categories and /categories/:id
router.use(verifyAuth, itemRoutes);      // Has /categories/:id/items and /items/:id
router.use('/upload', verifyAuth, uploadRoutes);

export default router;
