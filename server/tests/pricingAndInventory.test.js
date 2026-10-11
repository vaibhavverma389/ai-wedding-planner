import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/database.js';
import { User } from '../src/models/User.js';
import { VendorProfile } from '../src/models/VendorProfile.js';
import { Category } from '../src/models/Category.js';
import { Listing } from '../src/models/Listing.js';
import { RentalReservation } from '../src/models/RentalReservation.js';
import { Cart } from '../src/models/Cart.js';
import { QuoteRequest } from '../src/models/QuoteRequest.js';
import { Quotation } from '../src/models/Quotation.js';
import { generateAccessToken } from '../src/utils/tokens.js';
import {
  checkRentalAvailability,
  createRentalHold,
  releaseRentalHold,
  cleanupExpiredHolds
} from '../src/services/availabilityService.js';
import { calculateCartPricing } from '../src/services/pricingService.js';

let mongoServer;
let customerUser;
let customerToken;
let vendorUser;
let vendorToken;
let vendorProfile;
let rentalListing;
let retailListing;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await connectDB(mongoServer.getUri());

  // Create test category
  const category = await Category.create({
    name: 'Transportation & Decor',
    slug: 'transportation-and-decor'
  });

  // Create test customer
  customerUser = await User.create({
    name: 'Ananya Roy',
    email: 'ananya.roy@example.com',
    phone: '9888877771',
    password: 'Password123!',
    role: 'customer'
  });
  customerToken = generateAccessToken(customerUser);

  // Create test vendor
  vendorUser = await User.create({
    name: 'Vikram Rajput',
    email: 'vikram.rajput@example.com',
    phone: '9888877772',
    password: 'Password123!',
    role: 'vendor'
  });
  vendorToken = generateAccessToken(vendorUser);

  vendorProfile = await VendorProfile.create({
    userId: vendorUser._id,
    businessName: 'Rajput Royal Fleets & Decor',
    slug: 'rajput-royal-fleets-decor',
    serviceableCities: ['Delhi NCR', 'Jaipur']
  });

  // Create RENT listing (Stock = 2)
  rentalListing = await Listing.create({
    vendorId: vendorProfile._id,
    title: 'Vintage Mercedes Convertible Wedding Car',
    slug: 'vintage-mercedes-convertible-wedding-car',
    description: 'Chauffeured vintage white convertible for groom Baraat entry.',
    categoryId: category._id,
    transactionType: 'RENT',
    media: [{ url: 'https://example.com/car.jpg', isPrimary: true }],
    pricing: {
      basePrice: 20000, // Rs. 20,000 per day
      priceUnit: 'per_day',
      securityDeposit: 10000 // Rs. 10,000 refundable deposit
    },
    serviceableCities: ['Delhi NCR'],
    stockQuantity: 2,
    status: 'published'
  });

  // Create BUY_NEW listing (Stock = 20)
  retailListing = await Listing.create({
    vendorId: vendorProfile._id,
    title: 'Pure Brass Floating Diya Uruli (16-inch)',
    slug: 'pure-brass-floating-diya-uruli-16-inch',
    description: 'Traditional wedding entrance decor uruli.',
    categoryId: category._id,
    transactionType: 'BUY_NEW',
    media: [{ url: 'https://example.com/uruli.jpg', isPrimary: true }],
    pricing: {
      basePrice: 3500,
      priceUnit: 'per_item',
      securityDeposit: 0
    },
    serviceableCities: ['Delhi NCR'],
    stockQuantity: 20,
    status: 'published'
  });
});

afterAll(async () => {
  await disconnectDB();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  await RentalReservation.deleteMany({});
  await Cart.deleteMany({});
});

describe('Phase 4 — Availability, Pricing Engine, Cart & Quotations', () => {
  describe('Availability Engine & Atomic Holds', () => {
    const startDate = new Date('2026-12-10T10:00:00Z');
    const endDate = new Date('2026-12-12T10:00:00Z'); // 2 days

    it('should report full availability when no reservations exist', async () => {
      const avail = await checkRentalAvailability(rentalListing._id, startDate, endDate, 1);
      expect(avail.isAvailable).toBe(true);
      expect(avail.availableQuantity).toBe(2);
      expect(avail.reservedQuantity).toBe(0);
    });

    it('should create an atomic hold and decrease available inventory', async () => {
      const hold = await createRentalHold(rentalListing._id, customerUser._id, startDate, endDate, 1, 15);
      expect(hold.status).toBe('HOLD');
      expect(hold.depositAmount).toBe(10000);
      expect(hold.expiresAt.getTime()).toBeGreaterThan(Date.now());

      // Check remaining stock
      const checkAfter = await checkRentalAvailability(rentalListing._id, startDate, endDate, 1);
      expect(checkAfter.availableQuantity).toBe(1);
    });

    it('should reject hold request if requested quantity exceeds available stock', async () => {
      // Hold both available cars
      await createRentalHold(rentalListing._id, customerUser._id, startDate, endDate, 2, 15);

      // Attempting to hold 1 more should fail with 409 conflict
      await expect(
        createRentalHold(rentalListing._id, customerUser._id, startDate, endDate, 1, 15)
      ).rejects.toThrow(/Insufficient rental inventory/);
    });

    it('should release hold and restore available inventory', async () => {
      const hold = await createRentalHold(rentalListing._id, customerUser._id, startDate, endDate, 1, 15);
      await releaseRentalHold(hold._id, customerUser._id);

      const checkRestored = await checkRentalAvailability(rentalListing._id, startDate, endDate, 1);
      expect(checkRestored.availableQuantity).toBe(2);
    });

    it('should automatically cleanup expired holds', async () => {
      // Create a hold with past expiration
      const expiredHold = await RentalReservation.create({
        listingId: rentalListing._id,
        userId: customerUser._id,
        startDate,
        endDate,
        quantity: 1,
        status: 'HOLD',
        expiresAt: new Date(Date.now() - 5000) // 5 seconds in the past
      });

      const cleanedCount = await cleanupExpiredHolds();
      expect(cleanedCount).toBe(1);

      const updated = await RentalReservation.findById(expiredHold._id);
      expect(updated.status).toBe('CANCELLED');
    });
  });

  describe('Centralized Server Pricing Engine', () => {
    it('should calculate tamper-proof rental price based on days and deposits', async () => {
      const items = [
        {
          listingId: rentalListing._id,
          transactionType: 'RENT',
          quantity: 1,
          rentalStartDate: new Date('2026-12-10T00:00:00Z'),
          rentalEndDate: new Date('2026-12-13T00:00:00Z') // 3 days
        }
      ];

      const pricing = await calculateCartPricing(items);

      // 3 days * Rs. 20,000 = Rs. 60,000
      expect(pricing.totalItemAmount).toBe(60000);
      // Security deposit = Rs. 10,000
      expect(pricing.totalDepositAmount).toBe(10000);
      // GST 18% on Rs. 60,000 = Rs. 10,800
      expect(pricing.totalTaxAmount).toBe(10800);
      // Gross = 60,000 + 10,800 (GST) + 10,000 (Deposit) = Rs. 80,800
      expect(pricing.grossPayableAmount).toBe(80800);

      // Verify vendor sub-order split: 10% platform commission on 60,000 = 6,000
      const vendorOrder = pricing.vendorOrders[0];
      expect(vendorOrder.commissionAmount).toBe(6000);
      expect(vendorOrder.vendorPayoutAmount).toBe(54000);
    });

    it('should support mixed cart with coupon discounts', async () => {
      const items = [
        {
          listingId: retailListing._id,
          transactionType: 'BUY_NEW',
          quantity: 2 // 2 * 3,500 = Rs. 7,000
        }
      ];

      const pricingWithCoupon = await calculateCartPricing(items, 'SHAADI10');

      expect(pricingWithCoupon.totalItemAmount).toBe(7000);
      expect(pricingWithCoupon.discountAmount).toBe(700); // 10% of 7000
      const taxable = 6300;
      expect(pricingWithCoupon.totalTaxAmount).toBe(Math.round(taxable * 0.18));
    });
  });

  describe('Cart Integration Endpoints', () => {
    it('POST /api/v1/cart/items should add rental item and place 15-min hold', async () => {
      const res = await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          listingId: rentalListing._id.toString(),
          quantity: 1,
          rentalStartDate: '2026-12-15T00:00:00Z',
          rentalEndDate: '2026-12-16T00:00:00Z'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBe(1);
      expect(res.body.data.items[0].reservationHoldId).toBeDefined();

      // Check active hold in DB
      const holdInDb = await RentalReservation.findById(res.body.data.items[0].reservationHoldId);
      expect(holdInDb).not.toBeNull();
      expect(holdInDb.status).toBe('HOLD');
    });

    it('DELETE /api/v1/cart/items/:id should remove item and release reservation hold', async () => {
      // Add item
      const addRes = await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          listingId: rentalListing._id.toString(),
          quantity: 1,
          rentalStartDate: '2026-12-20T00:00:00Z',
          rentalEndDate: '2026-12-21T00:00:00Z'
        });

      const itemId = addRes.body.data.items[0]._id;
      const holdId = addRes.body.data.items[0].reservationHoldId;

      // Delete item
      const deleteRes = await request(app)
        .delete(`/api/v1/cart/items/${itemId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.data.items.length).toBe(0);

      // Verify hold was cancelled
      const holdCheck = await RentalReservation.findById(holdId);
      expect(holdCheck.status).toBe('CANCELLED');
    });
  });

  describe('Vendor Quotation Negotiation Workflow', () => {
    let quoteRequestId;
    let quotationId;

    it('POST /api/v1/quotes/requests should allow customer to submit wedding RFQ', async () => {
      const res = await request(app)
        .post('/api/v1/quotes/requests')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          vendorId: vendorProfile._id.toString(),
          eventType: 'Grand Sangeet & Reception',
          eventDate: '2026-12-25T18:00:00Z',
          guestCount: 500,
          city: 'Jaipur',
          venueDetails: 'Jai Mahal Palace',
          requirements: 'Complete floral stage setup, LED sound wall, and 4 luxury Baraat sedans.'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('PENDING');
      quoteRequestId = res.body.data._id;
    });

    it('POST /api/v1/quotes should allow vendor to issue quotation with milestones', async () => {
      const res = await request(app)
        .post('/api/v1/quotes')
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({
          quoteRequestId,
          title: 'Royal Palace Decor & Car Package',
          lineItems: [
            { description: 'Stage Floral Architecture', amount: 80000 },
            { description: '4 Vintage Sedan Escorts', amount: 70000 }
          ],
          inclusions: ['On-site coordinator', 'Backup power generators'],
          exclusions: ['Overtime beyond 2 AM']
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.subtotal).toBe(150000);
      expect(res.body.data.gstAmount).toBe(27000); // 18% of 150,000
      expect(res.body.data.totalAmount).toBe(177000);
      expect(res.body.data.milestones.length).toBe(2);
      expect(res.body.data.milestones[0].percentage).toBe(30);

      quotationId = res.body.data._id;
    });

    it('POST /api/v1/quotes/:id/accept should allow customer to accept quote and add advance to cart', async () => {
      const res = await request(app)
        .post(`/api/v1/quotes/${quotationId}/accept`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('ACCEPTED');

      // Verify cart now contains the advance milestone
      const cartRes = await request(app)
        .get('/api/v1/cart')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(cartRes.status).toBe(200);
      expect(cartRes.body.data.items.length).toBe(1);
      expect(cartRes.body.data.items[0].transactionType).toBe('BOOK_SERVICE');
      expect(cartRes.body.data.items[0].unitPrice).toBe(53100); // 30% of 177,000
    });
  });
});
