import mongoose from 'mongoose';

const quoteRequestSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VendorProfile',
      required: true,
      index: true
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      default: null
    },
    eventType: {
      type: String,
      required: [true, 'Event type is required'],
      trim: true
    },
    eventDate: {
      type: Date,
      required: [true, 'Event date is required']
    },
    guestCount: {
      type: Number,
      default: null
    },
    city: {
      type: String,
      required: [true, 'Event city is required'],
      trim: true
    },
    venueDetails: {
      type: String,
      default: ''
    },
    budgetRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 }
    },
    requirements: {
      type: String,
      required: [true, 'Specific requirements are required'],
      trim: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'QUOTED', 'ACCEPTED', 'DECLINED', 'EXPIRED'],
      default: 'PENDING',
      index: true
    }
  },
  {
    timestamps: true
  }
);

quoteRequestSchema.index({ customerId: 1, createdAt: -1 });
quoteRequestSchema.index({ vendorId: 1, status: 1 });

export const QuoteRequest = mongoose.model('QuoteRequest', quoteRequestSchema);
