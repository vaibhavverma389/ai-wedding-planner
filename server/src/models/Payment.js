import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
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
    gateway: {
      type: String,
      default: 'RAZORPAY'
    },
    razorpayOrderId: {
      type: String,
      required: true,
      index: true
    },
    razorpayPaymentId: {
      type: String,
      default: null,
      index: true
    },
    razorpaySignature: {
      type: String,
      default: null
    },
    amountInRupees: {
      type: Number,
      required: true,
      min: 0
    },
    amountInPaise: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    status: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED'],
      default: 'PENDING',
      index: true
    },
    paymentMethod: {
      type: String,
      default: null
    },
    idempotentKey: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },
    webhookEventsReceived: [
      {
        eventId: { type: String, required: true },
        eventType: { type: String, required: true },
        receivedAt: { type: Date, default: Date.now }
      }
    ],
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const Payment = mongoose.model('Payment', paymentSchema);
