import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import { User } from '../src/models/User.js';
import Category from '../src/models/Category.js';
import Listing from '../src/models/Listing.js';
import { VendorProfile } from '../src/models/VendorProfile.js';
import { generateAccessToken } from '../src/utils/tokens.js';

let mongoServer;
let customerToken;
let vendorToken;
let adminToken;
let testCategory;
let testListing;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Seed test users
  const customer = await User.create({
    name: 'Ananya Sharma',
    email: 'ananya@shaadisaathi.test',
    password: 'Password123!',
    phone: '+919876543210',
    role: 'customer',
    isEmailVerified: true
  });
  customerToken = generateAccessToken(customer);

  const vendor = await User.create({
    name: 'Rajesh Decorators',
    email: 'rajesh@shaadisaathi.test',
    password: 'Password123!',
    phone: '+919876543211',
    role: 'vendor',
    isEmailVerified: true
  });
  vendorToken = generateAccessToken(vendor);

  const vendorProfile = await VendorProfile.create({
    userId: vendor._id,
    businessName: 'Rajesh Decorators',
    slug: 'rajesh-decorators',
    serviceableCities: ['Delhi NCR']
  });

  const admin = await User.create({
    name: 'ShaadiSaathi Admin',
    email: 'admin@shaadisaathi.test',
    password: 'Password123!',
    phone: '+919876543212',
    role: 'admin',
    isEmailVerified: true
  });
  adminToken = generateAccessToken(admin);

  // Seed category & listing for recommendations
  testCategory = await Category.create({
    name: 'Decor & Floral Setup',
    slug: 'decor-floral-setup',
    description: 'Mandap, stage backdrops, and floral production',
    icon: 'flower',
    order: 1
  });

  testListing = await Listing.create({
    vendorId: vendorProfile._id,
    categoryId: testCategory._id,
    title: 'Grand Marigold Mandap & Stage Decor',
    slug: 'grand-marigold-mandap-stage-decor',
    description: 'Fresh festive yellow and orange marigold canopy setup with brass urlis.',
    transactionType: 'BOOK_SERVICE',
    pricing: { basePrice: 150000, priceType: 'FIXED' },
    serviceableCities: ['Delhi NCR'],
    averageRating: 4.8,
    totalReviews: 12,
    status: 'ACTIVE'
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('AI/ML Integration Suite (Node.js Gateway & Fallbacks)', () => {
  // 1. Budget Predictor
  it('POST /api/v1/ai/predict-budget - should generate wedding budget estimate with breakdown', async () => {
    const res = await request(app)
      .post('/api/v1/ai/predict-budget')
      .send({
        city: 'Jaipur',
        guestCount: 350,
        functionCount: 3,
        venueType: 'palace',
        cateringPreference: 'premium_gourmet',
        decorationLevel: 'royal_luxury',
        photographyPackage: 'cinematic_drone',
        eventDurationDays: 2
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.estimatedAmount).toBeGreaterThan(0);
    expect(res.body.data.lowerBound).toBeLessThan(res.body.data.estimatedAmount);
    expect(res.body.data.upperBound).toBeGreaterThan(res.body.data.estimatedAmount);
    expect(res.body.data.currency).toBe('INR');
    expect(res.body.data.breakdown.venueAndCatering).toBeGreaterThan(0);
    expect(res.body.data.isSyntheticData).toBe(true);
  });

  it('POST /api/v1/ai/predict-budget - should reject invalid inputs with 400', async () => {
    const res = await request(app)
      .post('/api/v1/ai/predict-budget')
      .send({
        city: 'Jaipur',
        guestCount: 5 // Below minimum 10
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // 2. Recommendations
  it('POST /api/v1/ai/recommendations - should rank active database listings with explainability', async () => {
    const res = await request(app)
      .post('/api/v1/ai/recommendations')
      .send({
        budget: 200000,
        city: 'Delhi NCR',
        categories: ['Decor & Floral Setup']
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.recommendations).toBeInstanceOf(Array);
    if (res.body.data.recommendations.length > 0) {
      const top = res.body.data.recommendations[0];
      expect(top.title).toBe('Grand Marigold Mandap & Stage Decor');
      expect(top.score).toBeGreaterThan(0);
      expect(top.reasons).toBeInstanceOf(Array);
    }
  });

  // 3. AI Wedding Planner
  it('POST /api/v1/ai/generate-plan - should generate timeline, checklist, and budget split', async () => {
    const res = await request(app)
      .post('/api/v1/ai/generate-plan')
      .send({
        totalBudget: 2500000,
        city: 'Mumbai',
        guestCount: 400,
        functions: ['Mehendi', 'Sangeet', 'Wedding', 'Reception']
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.timeline.length).toBeGreaterThan(0);
    expect(res.body.data.functionBudget.length).toBeGreaterThan(0);
    expect(res.body.data.checklist.length).toBeGreaterThan(0);
    expect(res.body.data.budgetSavingTips.length).toBeGreaterThan(0);
  });

  // 4. RAG Chatbot
  it('POST /api/v1/ai/chat - should return conversational answer with citations', async () => {
    const res = await request(app)
      .post('/api/v1/ai/chat')
      .send({
        message: 'How does rental security deposit and inventory hold work on ShaadiSaathi?'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.reply).toContain('rental');
    expect(res.body.data.citations.length).toBeGreaterThan(0);
  });

  // 5. Theme Discovery
  it('POST /api/v1/ai/discover-theme - should return color palettes and styling recommendations', async () => {
    const res = await request(app)
      .post('/api/v1/ai/discover-theme')
      .send({
        prompt: 'Royal Rajasthani heritage wedding with antique gold and red'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.palette.length).toBeGreaterThan(0);
    expect(res.body.data.recommendedDecorElements.length).toBeGreaterThan(0);
  });

  // 6. Catering Estimator
  it('POST /api/v1/ai/estimate-catering - should calculate attendance range and plate counts', async () => {
    const res = await request(app)
      .post('/api/v1/ai/estimate-catering')
      .send({
        totalInvited: 500,
        eventMealType: 'dinner',
        menuTier: 'standard_fusion'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.expectedAttendanceRange.minExpected).toBeGreaterThan(0);
    expect(res.body.data.recommendedPlateCount).toBeGreaterThan(0);
    expect(res.body.data.estimatedTotalCateringBudget).toBeGreaterThan(0);
  });

  // 7. Vendor Demand Forecasting (RBAC)
  it('GET /api/v1/ai/vendor-demand - should reject unauthorized customer with 403', async () => {
    const res = await request(app)
      .get('/api/v1/ai/vendor-demand')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
  });

  it('GET /api/v1/ai/vendor-demand - should allow vendor with 200 and return monthly trends', async () => {
    const res = await request(app)
      .get('/api/v1/ai/vendor-demand?city=Delhi%20NCR&category=Decor')
      .set('Authorization', `Bearer ${vendorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.monthlyProjections.length).toBe(5);
    expect(res.body.data.overallMarketTrend).toBe('STRONG_EXPANSION');
  });
});
