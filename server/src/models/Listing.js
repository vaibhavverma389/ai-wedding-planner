import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VendorProfile',
      required: [true, 'Vendor ID is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true
    },
    subcategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    transactionType: {
      type: String,
      enum: {
        values: ['RENT', 'BUY_NEW', 'BUY_USED', 'BOOK_SERVICE'],
        message: '{VALUE} is not a valid transaction type'
      },
      required: [true, 'Transaction type is required'],
      index: true
    },
    media: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: null },
        altText: { type: String, default: '' },
        isPrimary: { type: Boolean, default: false }
      }
    ],
    pricing: {
      basePrice: {
        type: Number,
        required: [true, 'Base price is required'],
        min: [0, 'Base price cannot be negative']
      },
      priceUnit: {
        type: String,
        enum: ['per_day', 'per_hour', 'per_item', 'per_plate', 'per_person', 'package', 'fixed'],
        default: 'per_item'
      },
      securityDeposit: {
        type: Number,
        default: 0,
        min: [0, 'Security deposit cannot be negative']
      },
      customQuotationOnly: {
        type: Boolean,
        default: false
      }
    },
    // RENT specific terms
    rentalTerms: {
      minRentalDays: { type: Number, default: 1, min: 1 },
      maxRentalDays: { type: Number, default: 30 },
      lateFeePerDay: { type: Number, default: 0 }
    },
    // BUY_USED specific details
    usedItemCondition: {
      condition: {
        type: String,
        enum: ['like_new', 'good', 'fair', null],
        default: null
      },
      ageInMonths: { type: Number, default: null },
      defectsDisclosed: { type: String, default: '' }
    },
    // BOOK_SERVICE specific details
    serviceDetails: {
      serviceType: { type: String, default: null },
      inclusions: { type: [String], default: [] },
      exclusions: { type: [String], default: [] },
      capacityMin: { type: Number, default: null },
      capacityMax: { type: Number, default: null }
    },
    serviceableCities: {
      type: [String],
      default: ['Delhi NCR']
    },
    stockQuantity: {
      type: Number,
      default: 1,
      min: [0, 'Stock quantity cannot be negative']
    },
    status: {
      type: String,
      enum: ['draft', 'pending_approval', 'published', 'rejected', 'archived'],
      default: 'published',
      index: true
    },
    moderationNotes: {
      type: String,
      default: null
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0
    },
    viewsCount: {
      type: Number,
      default: 0
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound and search indexes
listingSchema.index({ categoryId: 1, transactionType: 1, status: 1 });
listingSchema.index({ vendorId: 1, status: 1 });
listingSchema.index({ serviceableCities: 1 });
listingSchema.index({ 'pricing.basePrice': 1 });
listingSchema.index({ averageRating: -1 });
listingSchema.index({ createdAt: -1 });

// Full text search index
listingSchema.index({
  title: 'text',
  description: 'text',
  'serviceDetails.inclusions': 'text'
});

export const Listing = mongoose.model('Listing', listingSchema);
