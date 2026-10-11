import express from 'express';
import { paymentController } from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Verify payment signature submitted by client modal
router.post('/verify', requireAuth, paymentController.verifyPayment);

// Razorpay webhook endpoint (No user auth, verified cryptographically via X-Razorpay-Signature)
router.post('/webhook', paymentController.handleWebhook);

export default router;
