import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/database.js';
import { User } from '../src/models/User.js';
import { VendorProfile } from '../src/models/VendorProfile.js';
import { Category } from '../src/models/Category.js';
import { Listing } from '../src/models/Listing.js';
import { RentalReservation } from '../src/models/RentalReservation.js';
import { createRentalHold, checkRentalAvailability, cleanupExpiredHolds } from '../src/services/availabilityService.js';
import { generateAccessToken } from '../src/utils/tokens.js';

let mongoServer;
let userA;
let tokenA;
let userB;
let tokenB;
let vendorProfile;
let limitedListing;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await connectDB(mongoServer.getUri());

  const category = await Category.create({
    name: 'Luxury Vintage Cars',
    slug: 'luxury-vintage-cars'
  });

  userA = await User.create({
    name: 'Customer A',
    email: 'customer.a@example.com',
    phone: '9900112233',
    password: 'Password123!',
    role: 'customer'
  });
  tokenA = generateAccessToken(userA);

  userB = await User.create({
    name: 'Customer B',
    email: 'customer.b@example.com',
    phone: '9900112244',
    password: 'Password123!',
    role: 'customer'
  });
  tokenB = generateAccessToken(userB);

  const vendorUser = await User.create({
    name: 'Vintage Car Fleet Owner',
    email: 'vintage.fleet@example.com',
    phone: '9900112255',
    password: 'Password123!',
    role: 'vendor'
  });

  vendorProfile = await VendorProfile.create({
    userId: vendorUser._id,
    businessName: 'Royal Vintage Car Fleet',
    slug: 'royal-vintage-car-fleet'
  });

  // Listing with strictly 1 unit available
  limitedListing = await Listing.create({
    vendorId: vendorProfile._id,
    categoryId: category._id,
    title: '1947 Classic Rolls Royce Silver Dawn',
    slug: '1947-rolls-royce-silver-dawn',
    description: 'Bespoke vintage convertible with royal chauffeur',
    transactionType: 'RENT',
    pricing: {
      basePrice: 50000,
      priceUnit: 'per_day',
      securityDeposit: 25000
    },
    stockQuantity: 1, // Only 1 vehicle in inventory!
    status: 'published'
  });
});

afterAll(async () => {
  await disconnectDB();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('Phase 8 — Concurrency & High-Load Stress Suite', () => {
  it('should prevent overbooking when two users attempt concurrent reservation on the exact same date (Race Condition)', async () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 15);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    // Simultaneous requests fired at the exact same millisecond
    const [resultA, resultB] = await Promise.allSettled([
      createRentalHold(limitedListing._id, userA._id, startDate, endDate, 1),
      createRentalHold(limitedListing._id, userB._id, startDate, endDate, 1)
    ]);

    // Exactly one must succeed and one must be rejected due to zero remaining stock
    const fulfilled = [resultA, resultB].filter((r) => r.status === 'fulfilled');
    const rejected = [resultA, resultB].filter((r) => r.status === 'rejected');

    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);
    expect(rejected[0].reason.message).toContain('Insufficient rental inventory');

    // Confirm database has strictly 1 active hold
    const activeHolds = await RentalReservation.find({
      listingId: limitedListing._id,
      status: 'HOLD'
    });
    expect(activeHolds.length).toBe(1);
  });

  it('should automatically reclaim inventory when an expired hold is cleaned up', async () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 25);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    // Manually insert an expired hold (expired 5 minutes ago)
    await RentalReservation.create({
      listingId: limitedListing._id,
      userId: userA._id,
      startDate,
      endDate,
      quantity: 1,
      depositAmount: 25000,
      status: 'HOLD',
      expiresAt: new Date(Date.now() - 5 * 60 * 1000)
    });

    // Cleanup expired holds
    const releasedCount = await cleanupExpiredHolds();
    expect(releasedCount).toBeGreaterThanOrEqual(1);

    // Verify inventory check now confirms vehicle is available again
    const availability = await checkRentalAvailability(limitedListing._id, startDate, endDate, 1);

    expect(availability.isAvailable).toBe(true);
    expect(availability.availableQuantity).toBe(1);
  });

  it('should reject quantity requests exceeding the maximum physical stock', async () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 35);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    await expect(
      createRentalHold(limitedListing._id, userA._id, startDate, endDate, 5) // Stock is only 1!
    ).rejects.toThrow('Insufficient rental inventory. Only 1 unit(s) available for the selected dates.');
  });
});
