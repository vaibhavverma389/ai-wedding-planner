import express from 'express';
import { orderController } from '../controllers/orderController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

const router = express.Router();

// Customer endpoints
router.get('/my-orders', requireAuth, orderController.getMyOrders);

// Vendor endpoints
router.get('/vendor/orders', requireAuth, requireRole('vendor', 'admin'), orderController.getVendorOrders);

// Admin endpoints
router.get('/admin/all', requireAuth, requireRole('admin'), orderController.getAllOrdersAdmin);

// Single order details (RBAC isolated)
router.get('/:id', requireAuth, orderController.getOrderById);

// Fulfillment updates (Vendor/Admin)
router.patch('/:id/fulfillment', requireAuth, requireRole('vendor', 'admin'), orderController.updateFulfillmentStatus);

// Cancel order
router.post('/:id/cancel', requireAuth, orderController.cancelOrder);

// Release rental security deposit
router.post('/:id/return-deposit', requireAuth, requireRole('vendor', 'admin'), orderController.returnRentalDeposit);

export default router;
