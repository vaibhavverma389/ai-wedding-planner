import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true
    },
    landmark: {
      type: String,
      trim: true,
      default: ''
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      trim: true,
      match: [/^[1-9][0-9]{5}$/, 'Please provide a valid 6-digit Indian pincode']
    },
    addressType: {
      type: String,
      enum: ['home', 'venue', 'office', 'other'],
      default: 'home'
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

addressSchema.index({ userId: 1, isDefault: 1 });

export const Address = mongoose.model('Address', addressSchema);
