import express from 'express';
import { checkoutController } from '../controllers/checkoutController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Initialize checkout session & gateway order
router.post('/initialize', requireAuth, checkoutController.initializeCheckout);

export default router;
