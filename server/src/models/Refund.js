import mongoose from 'mongoose';

const refundSchema = new mongoose.Schema(
  {
    orderGroupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrderGroup',
      required: true,
      index: true
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null
    },
    razorpayRefundId: {
      type: String,
      default: null,
      index: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    refundType: {
      type: String,
      enum: ['CANCELLATION', 'RENTAL_DEPOSIT_RETURN', 'ADMIN_OVERRIDE'],
      required: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSED', 'FAILED'],
      default: 'PENDING',
      index: true
    },
    reason: {
      type: String,
      required: true
    },
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    processedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const Refund = mongoose.model('Refund', refundSchema);
