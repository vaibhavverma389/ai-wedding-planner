import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: [
        'ORDER_CONFIRMED',
        'PAYMENT_SUCCESS',
        'PAYMENT_FAILED',
        'ORDER_DISPATCHED',
        'ORDER_DELIVERED',
        'RENTAL_RETURN_DUE',
        'DEPOSIT_REFUNDED',
        'ORDER_CANCELLED',
        'SYSTEM_ALERT'
      ],
      default: 'SYSTEM_ALERT'
    },
    metadata: {
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
      orderGroupId: { type: mongoose.Schema.Types.ObjectId, ref: 'OrderGroup', default: null },
      link: { type: String, default: null }
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

export const Notification = mongoose.model('Notification', notificationSchema);
