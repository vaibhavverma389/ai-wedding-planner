import express from 'express';
import {
  getCart,
  addItemToCart,
  removeItemFromCart,
  applyCoupon
} from '../controllers/cartController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getCart);
router.post('/items', addItemToCart);
router.delete('/items/:itemId', removeItemFromCart);
router.post('/coupon', applyCoupon);

export default router;
