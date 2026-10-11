import { paymentService } from '../services/paymentService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import { Payment } from '../models/Payment.js';

export const paymentController = {
  /**
   * Verify Razorpay Payment Signature and finalize order fulfillment
   */
  async verifyPayment(req, res, next) {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        orderGroupId
      } = req.body;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return sendError(
          res,
          'Missing required Razorpay payment credentials for signature verification.',
          400,
          'MISSING_SIGNATURE_DATA'
        );
      }

      // 1. Verify Cryptographic HMAC SHA256 Signature
      const isValid = paymentService.verifySignature({
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature
      });

      if (!isValid) {
        logger.warn(`🚨 Payment signature tampering attempt detected for Order: ${razorpay_order_id}`);
        return sendError(
          res,
          'Invalid payment signature. Payment verification failed.',
          400,
          'INVALID_PAYMENT_SIGNATURE'
        );
      }

      // 2. Idempotent fulfillment
      const { orderGroup, isDuplicate } = await paymentService.processPaymentSuccess({
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        paymentMethod: req.body.paymentMethod || 'razorpay_upi_or_card',
        eventSource: 'CLIENT_VERIFY'
      });

      return sendSuccess(
        res,
        {
          orderGroupId: orderGroup._id,
          orderGroupNumber: orderGroup.orderGroupNumber,
          paymentStatus: orderGroup.paymentStatus,
          paidAt: orderGroup.paidAt,
          grossPayableAmount: orderGroup.pricingSnapshot.grossPayableAmount
        },
        isDuplicate ? 'Order already verified.' : 'Payment verified and order confirmed successfully.'
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Razorpay Webhook Handler
   */
  async handleWebhook(req, res, next) {
    try {
      const webhookSignature = req.headers['x-razorpay-signature'];
      const rawPayload = req.body;

      if (!webhookSignature) {
        return sendError(res, 'Missing x-razorpay-signature header', 400, 'WEBHOOK_SIGNATURE_MISSING');
      }

      const isValid = paymentService.verifyWebhook({
        rawBody: req.rawBody || rawPayload,
        signature: webhookSignature
      });

      if (!isValid) {
        logger.warn('🚨 Unauthorized Razorpay webhook call detected with invalid signature.');
        return sendError(res, 'Invalid webhook signature', 400, 'INVALID_WEBHOOK_SIGNATURE');
      }

      const event = rawPayload.event;
      const eventId = req.headers['x-razorpay-event-id'] || `ev_${Date.now()}`;
      logger.info(`🔔 Verified Razorpay Webhook Event: ${event} [${eventId}]`);

      if (event === 'payment.captured' || event === 'order.paid') {
        const paymentEntity = rawPayload.payload.payment.entity;
        const razorpayOrderId = paymentEntity.order_id;
        const razorpayPaymentId = paymentEntity.id;

        // Log webhook receipt in Payment document
        await Payment.findOneAndUpdate(
          { razorpayOrderId },
          {
            $push: {
              webhookEventsReceived: {
                eventId,
                eventType: event,
                receivedAt: new Date()
              }
            }
          }
        );

        await paymentService.processPaymentSuccess({
          razorpayOrderId,
          razorpayPaymentId,
          paymentMethod: paymentEntity.method,
          eventSource: 'WEBHOOK'
        });
      } else if (event === 'payment.failed') {
        const paymentEntity = rawPayload.payload.payment.entity;
        const razorpayOrderId = paymentEntity.order_id;

        await paymentService.processPaymentFailure({
          razorpayOrderId,
          reason: paymentEntity.error_description || 'Payment gateway failed'
        });
      }

      return res.status(200).json({ status: 'ok', received: true });
    } catch (error) {
      logger.error(`Webhook processing error: ${error.message}`);
      // Return 200 to prevent continuous retries for unhandled server issues
      return res.status(200).json({ status: 'handled_with_warning', message: error.message });
    }
  }
};
