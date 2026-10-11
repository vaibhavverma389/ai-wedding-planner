import mongoose from 'mongoose';

const rentalReservationSchema = new mongoose.Schema(
  {
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: [true, 'Listing ID is required'],
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrderGroup',
      default: null,
      index: true
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      default: 1
    },
    depositAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    status: {
      type: String,
      enum: ['HOLD', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
      default: 'HOLD',
      index: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index for date-range overlap queries
rentalReservationSchema.index({ listingId: 1, startDate: 1, endDate: 1, status: 1 });

export const RentalReservation = mongoose.model('RentalReservation', rentalReservationSchema);
