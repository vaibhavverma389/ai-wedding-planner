import mongoose from 'mongoose';

const vendorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
      minlength: [2, 'Business name must be at least 2 characters long']
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    businessType: {
      type: String,
      enum: ['individual', 'proprietorship', 'company', 'agency'],
      default: 'individual'
    },
    description: {
      type: String,
      default: ''
    },
    logoUrl: {
      type: String,
      default: null
    },
    bannerUrl: {
      type: String,
      default: null
    },
    serviceableCities: {
      type: [String],
      default: ['Delhi NCR'],
      index: true
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' }
    },
    panNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: null
    },
    gstin: {
      type: String,
      trim: true,
      uppercase: true,
      default: null
    },
    documents: [
      {
        type: { type: String, enum: ['pan', 'gst', 'business_proof', 'id_proof'] },
        url: { type: String, required: true },
        verified: { type: Boolean, default: false }
      }
    ],
    bankDetails: {
      accountNumber: { type: String, default: null },
      ifsc: { type: String, default: null },
      bankName: { type: String, default: null },
      beneficiaryName: { type: String, default: null }
    },
    commissionRate: {
      type: Number,
      default: 10,
      min: 0,
      max: 100
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'suspended'],
      default: 'pending'
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
    isFeatured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

vendorProfileSchema.index({ verificationStatus: 1 });
vendorProfileSchema.index({ businessName: 'text', description: 'text' });

export const VendorProfile = mongoose.model('VendorProfile', vendorProfileSchema);
