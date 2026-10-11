import Razorpay from 'razorpay';
import crypto from 'crypto';
import { env } from './environment.js';
import { logger } from '../utils/logger.js';

let razorpayClient = null;

try {
  razorpayClient = new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET
  });
  logger.info(`💳 Razorpay client initialized in test mode (Key ID: ${env.RAZORPAY_KEY_ID})`);
} catch (err) {
  logger.warn(`⚠️ Razorpay initialization note: ${err.message}`);
}

export { razorpayClient };

/**
 * Generate HMAC-SHA256 signature for Razorpay verification
 */
export const generateRazorpaySignature = (orderId, paymentId, secret = env.RAZORPAY_KEY_SECRET) => {
  return crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
};

/**
 * Verify Razorpay payment signature
 */
export const verifyRazorpaySignature = (orderId, paymentId, signature, secret = env.RAZORPAY_KEY_SECRET) => {
  if (!signature || typeof signature !== 'string') return false;
  const expectedSignature = generateRazorpaySignature(orderId, paymentId, secret);
  const sigBuf = Buffer.from(signature, 'utf8');
  const expBuf = Buffer.from(expectedSignature, 'utf8');
  if (sigBuf.length !== expBuf.length) return false;
  return crypto.timingSafeEqual(sigBuf, expBuf);
};

/**
 * Verify Razorpay Webhook signature
 */
export const verifyRazorpayWebhookSignature = (rawBody, signature, webhookSecret = env.RAZORPAY_WEBHOOK_SECRET) => {
  if (!signature || !rawBody || typeof signature !== 'string') return false;
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody))
    .digest('hex');
  const sigBuf = Buffer.from(signature, 'utf8');
  const expBuf = Buffer.from(expectedSignature, 'utf8');
  if (sigBuf.length !== expBuf.length) return false;
  return crypto.timingSafeEqual(sigBuf, expBuf);
};
