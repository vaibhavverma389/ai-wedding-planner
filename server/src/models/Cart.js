import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      default: null
    },
    transactionType: {
      type: String,
      enum: ['RENT', 'BUY_NEW', 'BUY_USED', 'BOOK_SERVICE'],
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    rentalStartDate: {
      type: Date,
      default: null
    },
    rentalEndDate: {
      type: Date,
      default: null
    },
    reservationHoldId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RentalReservation',
      default: null
    },
    quotationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quotation',
      default: null
    },
    milestoneIndex: {
      type: Number,
      default: null
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    items: [cartItemSchema],
    couponCode: {
      type: String,
      trim: true,
      uppercase: true,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const Cart = mongoose.model('Cart', cartSchema);
