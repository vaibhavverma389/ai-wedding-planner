import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/database.js';
import { User } from '../src/models/User.js';
import { VendorProfile } from '../src/models/VendorProfile.js';
import { Category } from '../src/models/Category.js';
import { Listing } from '../src/models/Listing.js';
import { OrderGroup } from '../src/models/OrderGroup.js';
import { Order } from '../src/models/Order.js';
import { generateAccessToken } from '../src/utils/tokens.js';

let mongoServer;
let customerUser;
let customerToken;
let vendorUser;
let vendorToken;
let vendorProfile;
let adminUser;
let adminToken;
let sampleListing;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await connectDB(mongoServer.getUri());

  // Category
  const category = await Category.create({
    name: 'Wedding Photography',
    slug: 'wedding-photography'
  });

  // Customer
  customerUser = await User.create({
    name: 'Ananya Roy',
    email: 'ananya.roy@example.com',
    phone: '9988776655',
    password: 'Password123!',
    role: 'customer'
  });
  customerToken = generateAccessToken(customerUser);

  // Vendor
  vendorUser = await User.create({
    name: 'Karan Mehra',
    email: 'karan@example.com',
    phone: '9988776656',
    password: 'Password123!',
    role: 'vendor'
  });
  vendorToken = generateAccessToken(vendorUser);

  vendorProfile = await VendorProfile.create({
    userId: vendorUser._id,
    businessName: 'Royal Clicks Photography',
    slug: 'royal-clicks-photography',
    verificationStatus: 'pending',
    serviceableCities: ['Delhi NCR', 'Jaipur'],
    supportEmail: 'karan@example.com'
  });

  sampleListing = await Listing.create({
    vendorId: vendorProfile._id,
    categoryId: category._id,
    title: 'Pre-Wedding & Drone Cinema Package',
    slug: 'pre-wedding-and-drone-cinema',
    description: 'Cinematic 4K coverage with drones and candid specialists',
    transactionType: 'BOOK_SERVICE',
    pricing: {
      basePrice: 85000,
      priceUnit: 'package'
    },
    status: 'pending_approval'
  });

  // Admin
  adminUser = await User.create({
    name: 'Platform SuperAdmin',
    email: 'admin@shaadisaathi.in',
    phone: '9988776657',
    password: 'Password123!',
    role: 'admin'
  });
  adminToken = generateAccessToken(adminUser);

  // Seed sample order for analytics
  const group = await OrderGroup.create({
    orderGroupNumber: 'SS-GRP-TEST-ANALYTICS',
    customerId: customerUser._id,
    deliveryAddress: { fullName: 'Ananya', phone: '9988776655', street: 'MG Rd', city: 'Delhi', state: 'Delhi', pincode: '110001' },
    pricingSnapshot: { itemsSubtotal: 85000, grossPayableAmount: 100300 },
    paymentStatus: 'PAID'
  });

  await Order.create({
    orderNumber: 'SS-ORD-TEST-ANALYTICS-1',
    orderGroupId: group._id,
    customerId: customerUser._id,
    vendorId: vendorProfile._id,
    items: [{ listingId: sampleListing._id, title: 'Pre-Wedding Cinema', transactionType: 'BOOK_SERVICE', quantity: 1, unitPrice: 85000, lineSubtotal: 85000 }],
    pricing: { subtotal: 85000, commissionAmount: 8500, vendorPayoutAmount: 76500 },
    paymentStatus: 'PAID',
    fulfillmentStatus: 'CONFIRMED'
  });
});

afterAll(async () => {
  await disconnectDB();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('Phase 7 — Dashboards and Event Planner Suite', () => {
  describe('1. Wedding Event Planner (Customer Portal)', () => {
    it('should initialize and retrieve customer wedding plan with default sub-events and analytics', async () => {
      const res = await request(app)
        .get('/api/v1/events/my-event')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.event).toBeDefined();
      expect(res.body.data.event.subEvents.length).toBeGreaterThanOrEqual(4);
      expect(res.body.data.event.budgetExpenses.length).toBeGreaterThanOrEqual(5);
      expect(res.body.data.analytics.totalBudget).toBe(1500000);
      expect(res.body.data.analytics.remainingBudget).toBeGreaterThan(0);
    });

    it('should update overall wedding title and budget', async () => {
      const res = await request(app)
        .put('/api/v1/events/my-event')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          weddingTitle: "Ananya & Arjun's Royal Vivah",
          totalBudget: 2000000
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.event.weddingTitle).toBe("Ananya & Arjun's Royal Vivah");
      expect(res.body.data.event.totalBudget).toBe(2000000);
    });

    it('should add a custom sub-event and delete it', async () => {
      const addRes = await request(app)
        .post('/api/v1/events/sub-events')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          name: 'Cocktail Party & Afterhours',
          time: '09:00 PM',
          venue: 'Sky Lounge Poolside',
          guestCount: 120
        });

      expect(addRes.status).toBe(200);
      expect(addRes.body.data.subEvents.some((e) => e.name === 'Cocktail Party & Afterhours')).toBe(true);

      const addedId = addRes.body.data.subEvents.find((e) => e.name === 'Cocktail Party & Afterhours')._id;

      const delRes = await request(app)
        .delete(`/api/v1/events/sub-events/${addedId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(delRes.status).toBe(200);
      expect(delRes.body.data.subEvents.some((e) => e.name === 'Cocktail Party & Afterhours')).toBe(false);
    });

    it('should add a budget line and delete it', async () => {
      const addRes = await request(app)
        .post('/api/v1/events/budget')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          category: 'Catering & Food',
          title: 'Special Live Chaat Counters',
          estimatedCost: 50000,
          actualCost: 45000,
          isPaid: true
        });

      expect(addRes.status).toBe(200);
      const addedId = addRes.body.data.budgetExpenses.find((b) => b.title === 'Special Live Chaat Counters')._id;

      const delRes = await request(app)
        .delete(`/api/v1/events/budget/${addedId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(delRes.status).toBe(200);
    });

    it('should add, toggle, and delete wedding tasks', async () => {
      const addRes = await request(app)
        .post('/api/v1/events/tasks')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          title: 'Finalize Mehendi artist design portfolio',
          category: 'Mehendi',
          priority: 'HIGH'
        });

      expect(addRes.status).toBe(200);
      const taskId = addRes.body.data.tasks.find((t) => t.title === 'Finalize Mehendi artist design portfolio')._id;

      // Toggle status
      const toggleRes = await request(app)
        .patch(`/api/v1/events/tasks/${taskId}/toggle`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(toggleRes.status).toBe(200);
      expect(toggleRes.body.data.task.isCompleted).toBe(true);

      // Delete task
      const delRes = await request(app)
        .delete(`/api/v1/events/tasks/${taskId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(delRes.status).toBe(200);
    });

    it('should add guest with RSVP and delete guest', async () => {
      const addRes = await request(app)
        .post('/api/v1/events/guests')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          name: 'Rajiv & Meera Singhania',
          side: 'BRIDE',
          rsvpStatus: 'ATTENDING',
          attendingCount: 3,
          dietaryPreference: 'VEG'
        });

      expect(addRes.status).toBe(200);
      const guestId = addRes.body.data.guests.find((g) => g.name === 'Rajiv & Meera Singhania')._id;

      const delRes = await request(app)
        .delete(`/api/v1/events/guests/${guestId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(delRes.status).toBe(200);
    });
  });

  describe('2. Vendor Dashboard Analytics', () => {
    it('should retrieve vendor store earnings, active listings, and order metrics', async () => {
      const res = await request(app)
        .get('/api/v1/vendors/dashboard/analytics')
        .set('Authorization', `Bearer ${vendorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.analytics.totalEarnings).toBe(76500);
      expect(res.body.data.analytics.totalOrders).toBe(1);
      expect(res.body.data.vendor.businessName).toBe('Royal Clicks Photography');
    });
  });

  describe('3. Admin Portal Oversight & Moderation', () => {
    it('should calculate platform-wide GMV and commission earnings', async () => {
      const res = await request(app)
        .get('/api/v1/admin/analytics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.grossMerchandiseValue).toBe(100300);
      expect(res.body.data.totalPlatformCommissions).toBe(8500);
      expect(res.body.data.totalVendors).toBeGreaterThan(0);
    });

    it('should list vendors for verification and approve vendor profile', async () => {
      const listRes = await request(app)
        .get('/api/v1/admin/vendors?status=pending')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body.data.vendors.length).toBeGreaterThan(0);

      const updateRes = await request(app)
        .patch(`/api/v1/admin/vendors/${vendorProfile._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ verificationStatus: 'verified' });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.vendor.verificationStatus).toBe('verified');
    });

    it('should moderate listing from pending_approval to published', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/listings/${sampleListing._id}/moderation`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'published',
          moderationNotes: 'Listing adheres to platform image and pricing guidelines.'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.listing.status).toBe('published');
    });
  });
});
