import express from 'express';
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
import { validate } from '../middleware/validate.js';
import { createCategorySchema, updateCategorySchema } from '../validators/categorySchemas.js';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);

// Admin-protected routes
router.post('/', requireAuth, requireRole('admin'), validate(createCategorySchema), createCategory);
router.put('/:id', requireAuth, requireRole('admin'), validate(updateCategorySchema), updateCategory);
router.delete('/:id', requireAuth, requireRole('admin'), deleteCategory);

export default router;
