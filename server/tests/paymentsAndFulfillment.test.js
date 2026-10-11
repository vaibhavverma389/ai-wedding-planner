import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import crypto from 'crypto';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/database.js';
import { User } from '../src/models/User.js';
import { VendorProfile } from '../src/models/VendorProfile.js';
import { Category } from '../src/models/Category.js';
import { Listing } from '../src/models/Listing.js';
import { RentalReservation } from '../src/models/RentalReservation.js';
import { Cart } from '../src/models/Cart.js';
import { OrderGroup } from '../src/models/OrderGroup.js';
import { Order } from '../src/models/Order.js';
import { Payment } from '../src/models/Payment.js';
import { Notification } from '../src/models/Notification.js';
import { generateAccessToken } from '../src/utils/tokens.js';
import { generateRazorpaySignature } from '../src/config/razorpay.js';
import { env } from '../src/config/environment.js';

let mongoServer;
let customerUser;
let customerToken;
let otherCustomerUser;
let otherCustomerToken;
let vendorUser;
let vendorToken;
let vendorProfile;
let rentalListing;
let retailListing;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await connectDB(mongoServer.getUri());

  // Category
  const category = await Category.create({
    name: 'Wedding Decor & Essentials',
    slug: 'wedding-decor-and-essentials'
  });

  // Customer 1
  customerUser = await User.create({
    name: 'Pooja Hegde',
    email: 'pooja@example.com',
    phone: '9876543210',
    password: 'Password123!',
    role: 'customer'
  });
  customerToken = generateAccessToken(customerUser);

  // Customer 2 (for data isolation tests)
  otherCustomerUser = await User.create({
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '9876543211',
    password: 'Password123!',
    role: 'customer'
  });
  otherCustomerToken = generateAccessToken(otherCustomerUser);

  // Vendor
  vendorUser = await User.create({
    name: 'Rajesh Khanna',
    email: 'rajesh.khanna@example.com',
    phone: '9876543212',
    password: 'Password123!',
    role: 'vendor'
  });
  vendorToken = generateAccessToken(vendorUser);

  vendorProfile = await VendorProfile.create({
    userId: vendorUser._id,
    businessName: 'Royal Mandap & Lighting',
    slug: 'royal-mandap-and-lighting',
    description: 'Premier wedding setup vendor',
    categories: [category._id],
    verificationStatus: 'verified',
    serviceableCities: ['Delhi NCR', 'Jaipur'],
    supportEmail: 'royal@example.com',
    phone: '9876543212'
  });

  // Rental Listing
  rentalListing = await Listing.create({
    vendorId: vendorProfile._id,
    categoryId: category._id,
    title: 'Vintage Royal Mandap Set',
    slug: 'vintage-royal-mandap-set',
    description: 'Antique brass mandap structure with floral pillars',
    transactionType: 'RENT',
    pricing: {
      basePrice: 15000,
      priceUnit: 'per_day',
      securityDeposit: 10000
    },
    stockQuantity: 2,
    serviceableCities: ['Delhi NCR'],
    status: 'published'
  });

  // Retail Listing
  retailListing = await Listing.create({
    vendorId: vendorProfile._id,
    categoryId: category._id,
    title: 'Handcrafted Bridal Gift Hamper',
    slug: 'handcrafted-bridal-gift-hamper',
    description: 'Luxury sweets and brass diya set',
    transactionType: 'BUY_NEW',
    pricing: {
      basePrice: 2500,
      priceUnit: 'per_item',
      securityDeposit: 0
    },
    stockQuantity: 10,
    serviceableCities: ['Delhi NCR'],
    status: 'published'
  });
});

afterAll(async () => {
  await disconnectDB();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('Phase 5 — Payments and Fulfillment Suite', () => {
  let activeOrderGroupId;
  let activeRazorpayOrderId;
  let activeSubOrderId;

  describe('1. Checkout Initialization (POST /api/v1/checkout/initialize)', () => {
    it('should reject checkout if cart is empty', async () => {
      const res = await request(app)
        .post('/api/v1/checkout/initialize')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          deliveryAddress: {
            fullName: 'Pooja Hegde',
            phone: '9876543210',
            street: 'MG Road',
            city: 'New Delhi',
            state: 'Delhi',
            pincode: '110001'
          }
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('CART_EMPTY');
    });

    it('should initialize checkout with mixed items and generate pending orders & Razorpay order', async () => {
      // Setup cart with rental and retail items
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 10);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 2); // 2 days rental

      const hold = await RentalReservation.create({
        listingId: rentalListing._id,
        userId: customerUser._id,
        startDate,
        endDate,
        quantity: 1,
        depositAmount: 10000,
        status: 'HOLD',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000)
      });

      await Cart.create({
        userId: customerUser._id,
        items: [
          {
            listingId: rentalListing._id,
            transactionType: 'RENT',
            quantity: 1,
            rentalStartDate: startDate,
            rentalEndDate: endDate,
            reservationHoldId: hold._id
          },
          {
            listingId: retailListing._id,
            transactionType: 'BUY_NEW',
            quantity: 2
          }
        ]
      });

      const res = await request(app)
        .post('/api/v1/checkout/initialize')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          deliveryAddress: {
            fullName: 'Pooja Hegde',
            phone: '9876543210',
            street: '42 Chhatarpur Farms',
            city: 'New Delhi',
            state: 'Delhi',
            pincode: '110074'
          }
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orderGroupId).toBeDefined();
      expect(res.body.data.razorpayOrderId).toBeDefined();
      expect(res.body.data.currency).toBe('INR');
      expect(res.body.data.amount).toBeGreaterThan(0);

      activeOrderGroupId = res.body.data.orderGroupId;
      activeRazorpayOrderId = res.body.data.razorpayOrderId;

      // Verify database state: OrderGroup and Order created as PENDING
      const orderGroup = await OrderGroup.findById(activeOrderGroupId).populate('vendorOrders');
      expect(orderGroup).not.toBeNull();
      expect(orderGroup.paymentStatus).toBe('PENDING');
      expect(orderGroup.vendorOrders.length).toBe(1);

      activeSubOrderId = orderGroup.vendorOrders[0]._id;
      const subOrder = await Order.findById(activeSubOrderId);
      expect(subOrder.paymentStatus).toBe('PENDING');
      expect(subOrder.fulfillmentStatus).toBe('PENDING');
      expect(subOrder.items.length).toBe(2);
    });
  });

  describe('2. Payment Signature Verification (POST /api/v1/payments/verify)', () => {
    it('should reject tampered or invalid Razorpay signature', async () => {
      const res = await request(app)
        .post('/api/v1/payments/verify')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          razorpay_order_id: activeRazorpayOrderId,
          razorpay_payment_id: 'pay_test_tampered123',
          razorpay_signature: 'invalid_sha256_hash_here_000000000000',
          orderGroupId: activeOrderGroupId
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_PAYMENT_SIGNATURE');
    });

    it('should verify genuine signature, confirm orders, transition rental hold, and decrement stock', async () => {
      const mockPaymentId = `pay_${Date.now()}`;
      const validSignature = generateRazorpaySignature(
        activeRazorpayOrderId,
        mockPaymentId,
        env.RAZORPAY_KEY_SECRET
      );

      const res = await request(app)
        .post('/api/v1/payments/verify')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          razorpay_order_id: activeRazorpayOrderId,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: validSignature,
          orderGroupId: activeOrderGroupId
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.paymentStatus).toBe('PAID');

      // 1. Verify OrderGroup is marked PAID
      const updatedGroup = await OrderGroup.findById(activeOrderGroupId);
      expect(updatedGroup.paymentStatus).toBe('PAID');
      expect(updatedGroup.paidAt).not.toBeNull();

      // 2. Verify sub-orders marked PAID and CONFIRMED
      const subOrder = await Order.findById(activeSubOrderId);
      expect(subOrder.paymentStatus).toBe('PAID');
      expect(subOrder.fulfillmentStatus).toBe('CONFIRMED');

      // 3. Verify rental reservation promoted to CONFIRMED
      const confirmedReservation = await RentalReservation.findOne({
        listingId: rentalListing._id,
        userId: customerUser._id
      });
      expect(confirmedReservation.status).toBe('CONFIRMED');
      expect(confirmedReservation.orderId.toString()).toBe(activeOrderGroupId.toString());

      // 4. Verify stock was decremented for retail item (started at 10, bought 2 -> 8)
      const updatedRetail = await Listing.findById(retailListing._id);
      expect(updatedRetail.stockQuantity).toBe(8);

      // 5. Verify customer cart was emptied
      const customerCart = await Cart.findOne({ userId: customerUser._id });
      expect(customerCart.items.length).toBe(0);

      // 6. Verify notifications were created
      const customerNotification = await Notification.findOne({
        recipientId: customerUser._id,
        type: 'PAYMENT_SUCCESS'
      });
      expect(customerNotification).not.toBeNull();
    });

    it('should be idempotent and safely handle duplicate verification calls without re-processing', async () => {
      const mockPaymentId = `pay_duplicate_${Date.now()}`;
      const validSignature = generateRazorpaySignature(
        activeRazorpayOrderId,
        mockPaymentId,
        env.RAZORPAY_KEY_SECRET
      );

      const res = await request(app)
        .post('/api/v1/payments/verify')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          razorpay_order_id: activeRazorpayOrderId,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: validSignature,
          orderGroupId: activeOrderGroupId
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('already verified');

      // Stock should NOT be decremented again (still 8)
      const retailCheck = await Listing.findById(retailListing._id);
      expect(retailCheck.stockQuantity).toBe(8);
    });
  });

  describe('3. Webhook Security and Processing (POST /api/v1/payments/webhook)', () => {
    it('should reject webhooks with missing or invalid signature', async () => {
      const res = await request(app)
        .post('/api/v1/payments/webhook')
        .set('x-razorpay-signature', 'fake_webhook_signature')
        .send({ event: 'payment.captured' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_WEBHOOK_SIGNATURE');
    });

    it('should accept valid webhook and idempotently record events', async () => {
      const webhookPayload = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_webhook_test_123',
              order_id: activeRazorpayOrderId,
              method: 'upi',
              amount: 500000
            }
          }
        }
      };

      const rawPayload = JSON.stringify(webhookPayload);
      const validWebhookSig = crypto
        .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
        .update(rawPayload)
        .digest('hex');

      const res = await request(app)
        .post('/api/v1/payments/webhook')
        .set('x-razorpay-signature', validWebhookSig)
        .set('Content-Type', 'application/json')
        .send(webhookPayload);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');

      // Verify payment document recorded the event
      const paymentDoc = await Payment.findOne({ razorpayOrderId: activeRazorpayOrderId });
      expect(paymentDoc).not.toBeNull();
      expect(paymentDoc.webhookEventsReceived.length).toBeGreaterThan(0);
    });
  });

  describe('4. Order Management, RBAC & Logistics', () => {
    it('should allow customer to view only their own orders', async () => {
      const res = await request(app)
        .get('/api/v1/orders/my-orders')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orders.length).toBeGreaterThan(0);
      expect(res.body.data.orders[0]._id.toString()).toBe(activeOrderGroupId.toString());
    });

    it('should isolate data and prevent other customer from viewing an order', async () => {
      const res = await request(app)
        .get(`/api/v1/orders/${activeSubOrderId}`)
        .set('Authorization', `Bearer ${otherCustomerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('should allow vendor to view their received orders', async () => {
      const res = await request(app)
        .get('/api/v1/orders/vendor/orders')
        .set('Authorization', `Bearer ${vendorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orders.length).toBeGreaterThan(0);
    });

    it('should allow vendor to update fulfillment status to DISPATCHED with tracking info', async () => {
      const res = await request(app)
        .patch(`/api/v1/orders/${activeSubOrderId}/fulfillment`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({
          fulfillmentStatus: 'DISPATCHED',
          courierName: 'Delhivery Express',
          trackingNumber: 'DEL-99887766'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.order.fulfillmentStatus).toBe('DISPATCHED');
      expect(res.body.data.order.deliveryDetails.trackingNumber).toBe('DEL-99887766');
    });

    it('should allow vendor to inspect rental return and refund security deposit with damage deduction', async () => {
      const res = await request(app)
        .post(`/api/v1/orders/${activeSubOrderId}/return-deposit`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({
          damageDeduction: 2000,
          deductionReason: 'Minor floral pillar scratch during reception'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.damageDeduction).toBe(2000);
      expect(res.body.data.netRefundAmount).toBe(8000); // 10000 deposit - 2000 deduction = 8000
      expect(res.body.data.refund).toBeDefined();

      const updatedOrder = await Order.findById(activeSubOrderId);
      expect(updatedOrder.rentalTracking.depositRefundStatus).toBe('FORFEITED_DAMAGE');
      expect(updatedOrder.rentalTracking.actualReturnDate).not.toBeNull();
    });

    it('should allow cancelling a pending order and restore product stock', async () => {
      // 1. Create a fresh order for testing cancellation
      const cancelGroup = await OrderGroup.create({
        orderGroupNumber: `SS-GRP-CANCEL-${Date.now()}`,
        customerId: customerUser._id,
        deliveryAddress: {
          fullName: 'Pooja Hegde',
          phone: '9876543210',
          street: 'Test St',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001'
        },
        pricingSnapshot: {
          itemsSubtotal: 2500,
          grossPayableAmount: 2950
        },
        paymentStatus: 'PAID'
      });

      const cancelOrder = await Order.create({
        orderNumber: `SS-ORD-CANCEL-${Date.now()}`,
        orderGroupId: cancelGroup._id,
        customerId: customerUser._id,
        vendorId: vendorProfile._id,
        items: [
          {
            listingId: retailListing._id,
            title: 'Handcrafted Bridal Gift Hamper',
            transactionType: 'BUY_NEW',
            quantity: 3,
            unitPrice: 2500,
            lineSubtotal: 7500
          }
        ],
        pricing: {
          subtotal: 7500,
          depositAmount: 0,
          commissionAmount: 750,
          vendorPayoutAmount: 6750
        },
        paymentStatus: 'PAID',
        fulfillmentStatus: 'CONFIRMED'
      });

      // Stock before cancellation was 8
      const res = await request(app)
        .post(`/api/v1/orders/${cancelOrder._id}/cancel`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ reason: 'Wedding venue changed' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const refreshedOrder = await Order.findById(cancelOrder._id);
      expect(refreshedOrder.fulfillmentStatus).toBe('CANCELLED');
      expect(refreshedOrder.paymentStatus).toBe('REFUNDED');

      // Stock restored: 8 + 3 = 11
      const restoredRetail = await Listing.findById(retailListing._id);
      expect(restoredRetail.stockQuantity).toBe(11);
    });
  });

  describe('5. In-App Notifications (GET & PATCH /api/v1/notifications)', () => {
    it('should allow user to fetch unread notifications and mark them as read', async () => {
      const res = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.notifications.length).toBeGreaterThan(0);

      const notifId = res.body.data.notifications[0]._id;

      const markRes = await request(app)
        .patch(`/api/v1/notifications/${notifId}/read`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(markRes.status).toBe(200);
      expect(markRes.body.data.notification.isRead).toBe(true);
    });
  });
});
