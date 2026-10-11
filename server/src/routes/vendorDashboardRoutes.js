import express from 'express';
import { vendorDashboardController } from '../controllers/vendorDashboardController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

const router = express.Router();

router.use(requireAuth, requireRole('vendor', 'admin'));

router.get('/analytics', vendorDashboardController.getDashboardAnalytics);

export default router;
