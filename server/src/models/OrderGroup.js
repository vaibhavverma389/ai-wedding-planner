import mongoose from 'mongoose';

const orderGroupSchema = new mongoose.Schema(
  {
    orderGroupNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer ID is required'],
      index: true
    },
    vendorOrders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
      }
    ],
    deliveryAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true }
    },
    pricingSnapshot: {
      itemsSubtotal: { type: Number, required: true, min: 0 },
      securityDepositTotal: { type: Number, default: 0, min: 0 },
      discountTotal: { type: Number, default: 0, min: 0 },
      taxTotal: { type: Number, default: 0, min: 0 },
      gstPercent: { type: Number, default: 18 },
      deliveryFeeTotal: { type: Number, default: 0, min: 0 },
      grossPayableAmount: { type: Number, required: true, min: 0 }
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'PARTIALLY_REFUNDED', 'REFUNDED'],
      default: 'PENDING',
      index: true
    },
    razorpayOrderId: {
      type: String,
      default: null,
      index: true
    },
    razorpayPaymentId: {
      type: String,
      default: null
    },
    idempotencyKey: {
      type: String,
      default: null,
      index: true
    },
    paidAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const OrderGroup = mongoose.model('OrderGroup', orderGroupSchema);
