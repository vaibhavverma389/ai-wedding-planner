import express from 'express';
import {
  checkAvailability,
  placeHold,
  releaseHold
} from '../controllers/availabilityController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/check', checkAvailability);
router.post('/hold', requireAuth, placeHold);
router.delete('/hold/:id', requireAuth, releaseHold);

export default router;
