import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    percentage: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    dueDate: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['PENDING', 'PAID'],
      default: 'PENDING'
    }
  },
  { _id: true }
);

const quotationSchema = new mongoose.Schema(
  {
    quoteRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuoteRequest',
      required: true,
      index: true
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VendorProfile',
      required: true,
      index: true
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    lineItems: [
      {
        description: { type: String, required: true },
        amount: { type: Number, required: true, min: 0 }
      }
    ],
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    gstAmount: {
      type: Number,
      required: true,
      min: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    inclusions: {
      type: [String],
      default: []
    },
    exclusions: {
      type: [String],
      default: []
    },
    milestones: [milestoneSchema],
    validUntil: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'],
      default: 'SENT',
      index: true
    }
  },
  {
    timestamps: true
  }
);

quotationSchema.index({ customerId: 1, status: 1 });
quotationSchema.index({ vendorId: 1, status: 1 });

export const Quotation = mongoose.model('Quotation', quotationSchema);
