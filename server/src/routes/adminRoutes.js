import express from 'express';
import { adminController } from '../controllers/adminController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

const router = express.Router();

router.use(requireAuth, requireRole('admin'));

router.get('/analytics', adminController.getPlatformAnalytics);
router.get('/vendors', adminController.getVendorsList);
router.patch('/vendors/:id/status', adminController.updateVendorVerificationStatus);
router.patch('/listings/:id/moderation', adminController.moderateListing);

export default router;
