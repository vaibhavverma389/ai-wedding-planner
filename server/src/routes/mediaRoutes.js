import express from 'express';
import { uploadMedia, deleteMedia } from '../controllers/mediaController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Only authenticated Vendors or Admins can upload media files
router.post('/upload', requireAuth, requireRole('vendor', 'admin'), upload.single('file'), uploadMedia);
router.post('/delete', requireAuth, requireRole('vendor', 'admin'), deleteMedia);

export default router;
