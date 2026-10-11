import express from 'express';
import {
  createQuoteRequest,
  getQuoteRequests,
  issueQuotation,
  getQuotationById,
  acceptQuotation,
  declineQuotation
} from '../controllers/quoteController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

const router = express.Router();

router.use(requireAuth);

router.post('/requests', createQuoteRequest);
router.get('/requests', getQuoteRequests);

router.post('/', requireRole('vendor'), issueQuotation);
router.get('/:id', getQuotationById);
router.post('/:id/accept', acceptQuotation);
router.post('/:id/decline', declineQuotation);

export default router;
