import { z } from 'zod';

export const createListingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(150),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Category ID'),
  subcategoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Subcategory ID').nullable().optional(),
  transactionType: z.enum(['RENT', 'BUY_NEW', 'BUY_USED', 'BOOK_SERVICE']),
  media: z.array(
    z.object({
      url: z.string().url('Invalid image URL'),
      publicId: z.string().optional().nullable(),
      altText: z.string().optional(),
      isPrimary: z.boolean().optional()
    })
  ).min(1, 'At least one photograph or media file is required'),
  pricing: z.object({
    basePrice: z.number().min(0, 'Base price must be non-negative'),
    priceUnit: z.enum(['per_day', 'per_hour', 'per_item', 'per_plate', 'per_person', 'package', 'fixed']).default('per_item'),
    securityDeposit: z.number().min(0).default(0),
    customQuotationOnly: z.boolean().default(false)
  }),
  rentalTerms: z.object({
    minRentalDays: z.number().min(1).default(1),
    maxRentalDays: z.number().default(30),
    lateFeePerDay: z.number().default(0)
  }).optional(),
  usedItemCondition: z.object({
    condition: z.enum(['like_new', 'good', 'fair']).nullable().optional(),
    ageInMonths: z.number().nullable().optional(),
    defectsDisclosed: z.string().default('')
  }).optional(),
  serviceDetails: z.object({
    serviceType: z.string().optional().nullable(),
    inclusions: z.array(z.string()).default([]),
    exclusions: z.array(z.string()).default([]),
    capacityMin: z.number().nullable().optional(),
    capacityMax: z.number().nullable().optional()
  }).optional(),
  serviceableCities: z.array(z.string()).min(1, 'At least one serviceable city must be specified'),
  stockQuantity: z.number().int().min(0).default(1),
  status: z.enum(['draft', 'pending_approval', 'published']).default('published')
});

export const updateListingSchema = createListingSchema.partial();

export const listingQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  subcategoryId: z.string().optional(),
  transactionType: z.enum(['RENT', 'BUY_NEW', 'BUY_USED', 'BOOK_SERVICE']).optional(),
  city: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minRating: z.coerce.number().optional(),
  vendorId: z.string().optional(),
  sort: z.enum(['price_asc', 'price_desc', 'newest', 'rating', 'popular']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});
