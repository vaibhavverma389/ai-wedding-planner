import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
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
    title: {
      type: String,
      required: true
    },
    slug: {
      type: String,
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
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    lineSubtotal: {
      type: Number,
      required: true,
      min: 0
    },
    lineDeposit: {
      type: Number,
      default: 0,
      min: 0
    },
    rentalPeriod: {
      startDate: { type: Date, default: null },
      endDate: { type: Date, default: null },
      rentalDays: { type: Number, default: null }
    },
    reservationHoldId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RentalReservation',
      default: null
    },
    itemStatus: {
      type: String,
      enum: ['CONFIRMED', 'DISPATCHED', 'DELIVERED', 'RETURNED', 'CANCELLED', 'REFUNDED'],
      default: 'CONFIRMED'
    }
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    orderGroupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrderGroup',
      required: true,
      index: true
    },
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
    items: [orderItemSchema],
    pricing: {
      subtotal: { type: Number, required: true, min: 0 },
      depositAmount: { type: Number, default: 0, min: 0 },
      commissionAmount: { type: Number, default: 0, min: 0 },
      vendorPayoutAmount: { type: Number, required: true, min: 0 }
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
      index: true
    },
    fulfillmentStatus: {
      type: String,
      enum: [
        'PENDING',
        'CONFIRMED',
        'PROCESSING',
        'DISPATCHED',
        'DELIVERED',
        'RETURN_IN_TRANSIT',
        'RETURNED_INSPECTED',
        'COMPLETED',
        'CANCELLED'
      ],
      default: 'PENDING',
      index: true
    },
    rentalTracking: {
      pickupScheduledDate: { type: Date, default: null },
      returnScheduledDate: { type: Date, default: null },
      actualReturnDate: { type: Date, default: null },
      depositRefundStatus: {
        type: String,
        enum: ['HELD', 'REFUNDED', 'FORFEITED_DAMAGE', 'FORFEITED_LATE', 'NOT_APPLICABLE'],
        default: 'NOT_APPLICABLE'
      },
      depositRefundAmount: { type: Number, default: 0 },
      deductionReason: { type: String, default: null }
    },
    deliveryDetails: {
      courierName: { type: String, default: null },
      trackingNumber: { type: String, default: null },
      deliveryNotes: { type: String, default: null },
      estimatedDeliveryDate: { type: Date, default: null }
    },
    cancellation: {
      isCancelled: { type: Boolean, default: false },
      reason: { type: String, default: null },
      requestedBy: {
        type: String,
        enum: ['CUSTOMER', 'VENDOR', 'ADMIN', null],
        default: null
      },
      cancelledAt: { type: Date, default: null },
      refundAmount: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true
  }
);

export const Order = mongoose.model('Order', orderSchema);
