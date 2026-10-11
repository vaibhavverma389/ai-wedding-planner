import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().optional(),
  parentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Parent ID format').nullable().optional(),
  icon: z.string().optional(),
  imageUrl: z.string().url().optional(),
  order: z.number().int().optional()
});

export const updateCategorySchema = createCategorySchema.partial().extend({
  isActive: z.boolean().optional()
});
