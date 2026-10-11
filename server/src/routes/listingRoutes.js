import express from 'express';
import {
  getListings,
  getListingBySlug,
  createListing,
  updateListing,
  deleteListing,
  getMyListings,
  updateListingStatus
} from '../controllers/listingController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
import { validate } from '../middleware/validate.js';
import {
  createListingSchema,
  updateListingSchema,
  listingQuerySchema
} from '../validators/listingSchemas.js';

const router = express.Router();

// Public routes
router.get('/', validate(listingQuerySchema, 'query'), getListings);
router.get('/detail/:slug', getListingBySlug);

// Vendor-protected routes
router.get('/my/listings', requireAuth, requireRole('vendor'), getMyListings);
router.post('/', requireAuth, requireRole('vendor', 'admin'), validate(createListingSchema), createListing);
router.put('/:id', requireAuth, requireRole('vendor', 'admin'), validate(updateListingSchema), updateListing);
router.delete('/:id', requireAuth, requireRole('vendor', 'admin'), deleteListing);
router.patch('/:id/status', requireAuth, requireRole('vendor', 'admin'), updateListingStatus);

export default router;
