import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/database.js';
import { User } from '../src/models/User.js';
import { VendorProfile } from '../src/models/VendorProfile.js';
import { Category } from '../src/models/Category.js';
import { Listing } from '../src/models/Listing.js';
import { generateAccessToken } from '../src/utils/tokens.js';
import { seedDatabase } from '../src/utils/seeder.js';

let mongoServer;
let adminToken;
let customerToken;
let vendor1Token;
let vendor2Token;
let vendor1Profile;
let vendor2Profile;
let parentCategory;
let subCategory;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await connectDB(mongoServer.getUri());

  // Run the seeder to populate realistic wedding categories & sample listings
  await seedDatabase();

  // Create test users
  const adminUser = await User.create({
    name: 'Admin System',
    email: 'admin.catalog@shaadisaathi.in',
    phone: '9900000001',
    password: 'AdminPassword123!',
    role: 'admin'
  });

  const customerUser = await User.create({
    name: 'Customer Test',
    email: 'customer.catalog@shaadisaathi.in',
    phone: '9900000002',
    password: 'CustomerPassword123!',
    role: 'customer'
  });

  const vendor1User = await User.create({
    name: 'Aarav Mehta',
    email: 'aarav.vendor@shaadisaathi.in',
    phone: '9900000003',
    password: 'VendorPassword123!',
    role: 'vendor'
  });

  vendor1Profile = await VendorProfile.create({
    userId: vendor1User._id,
    businessName: 'Mehta Royal Decorators',
    slug: 'mehta-royal-decorators',
    serviceableCities: ['Delhi NCR', 'Jaipur']
  });

  const vendor2User = await User.create({
    name: 'Rohan Verma',
    email: 'rohan.vendor@shaadisaathi.in',
    phone: '9900000004',
    password: 'VendorPassword123!',
    role: 'vendor'
  });

  vendor2Profile = await VendorProfile.create({
    userId: vendor2User._id,
    businessName: 'Verma Sound & Lighting',
    slug: 'verma-sound-lighting',
    serviceableCities: ['Mumbai']
  });

  adminToken = generateAccessToken(adminUser);
  customerToken = generateAccessToken(customerUser);
  vendor1Token = generateAccessToken(vendor1User);
  vendor2Token = generateAccessToken(vendor2User);

  parentCategory = await Category.findOne({ slug: 'wedding-decorations' });
  subCategory = await Category.findOne({ slug: 'mandap-decoration' });
});

afterAll(async () => {
  await disconnectDB();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('Phase 3 — Catalog, Categories, and Media Suite', () => {
  describe('Category Management', () => {
    it('GET /api/v1/categories should return hierarchical category tree with subcategories', async () => {
      const res = await request(app).get('/api/v1/categories');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(10);

      // Verify hierarchical structure
      const decorCat = res.body.data.find((c) => c.slug === 'wedding-decorations');
      expect(decorCat).toBeDefined();
      expect(Array.isArray(decorCat.subcategories)).toBe(true);
      expect(decorCat.subcategories.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/categories/:slug should return single category with subcategories', async () => {
      const res = await request(app).get('/api/v1/categories/wedding-decorations');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe('wedding-decorations');
      expect(res.body.data.subcategories.length).toBeGreaterThan(0);
    });

    it('POST /api/v1/categories should allow admin to create a category', async () => {
      const res = await request(app)
        .post('/api/v1/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Floral Jewelry & Garlands',
          description: 'Custom bridal floral jewelry and varmalas'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe('floral-jewelry-garlands');
    });

    it('POST /api/v1/categories should deny customer access with 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/v1/categories')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          name: 'Unauthorized Category'
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('Listing Creation and Ownership Authorization', () => {
    let createdListingId;
    let createdListingSlug;

    it('POST /api/v1/listings should allow vendor to create a RENT listing with unique slug', async () => {
      const res = await request(app)
        .post('/api/v1/listings')
        .set('Authorization', `Bearer ${vendor1Token}`)
        .send({
          title: 'Royal Brass Shehnai & Nagada Set',
          description: 'Traditional handcrafted brass Shehnai and Nagada acoustic instruments for royal palace wedding welcome entry.',
          categoryId: parentCategory._id.toString(),
          subcategoryId: subCategory._id.toString(),
          transactionType: 'RENT',
          media: [
            {
              url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
              isPrimary: true
            }
          ],
          pricing: {
            basePrice: 8500,
            priceUnit: 'per_day',
            securityDeposit: 3000
          },
          rentalTerms: {
            minRentalDays: 1,
            maxRentalDays: 4,
            lateFeePerDay: 1000
          },
          serviceableCities: ['Delhi NCR', 'Jaipur'],
          stockQuantity: 3,
          status: 'published'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Royal Brass Shehnai & Nagada Set');
      expect(res.body.data.slug).toContain('royal-brass-shehnai-nagada-set');
      expect(res.body.data.transactionType).toBe('RENT');
      expect(res.body.data.pricing.securityDeposit).toBe(3000);

      createdListingId = res.body.data._id;
      createdListingSlug = res.body.data.slug;
    });

    it('POST /api/v1/listings should deny customer access with 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/v1/listings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          title: 'Illegal Customer Listing',
          description: 'Customer should not be able to create marketplace listings.',
          categoryId: parentCategory._id.toString(),
          transactionType: 'BUY_NEW',
          media: [{ url: 'https://example.com/item.jpg' }],
          pricing: { basePrice: 1000 },
          serviceableCities: ['Delhi NCR']
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('PUT /api/v1/listings/:id should allow owner vendor to update their listing', async () => {
      const res = await request(app)
        .put(`/api/v1/listings/${createdListingId}`)
        .set('Authorization', `Bearer ${vendor1Token}`)
        .send({
          description: 'Updated description with brand new Shehnai reeds included.'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.description).toContain('brand new Shehnai reeds included');
    });

    it('PUT /api/v1/listings/:id should reject update from a different vendor (Vendor B vs Vendor A)', async () => {
      const res = await request(app)
        .put(`/api/v1/listings/${createdListingId}`)
        .set('Authorization', `Bearer ${vendor2Token}`)
        .send({
          title: 'Hacked Title by Another Vendor'
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('GET /api/v1/listings/detail/:slug should retrieve listing details and increment views', async () => {
      const res = await request(app).get(`/api/v1/listings/detail/${createdListingSlug}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe(createdListingSlug);
      expect(res.body.data.vendorId.businessName).toBe('Mehta Royal Decorators');
    });
  });

  describe('Faceted Search, Filters, and Pagination', () => {
    it('GET /api/v1/listings should filter by transactionType=RENT', async () => {
      const res = await request(app).get('/api/v1/listings?transactionType=RENT');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      res.body.data.forEach((item) => {
        expect(item.transactionType).toBe('RENT');
      });
    });

    it('GET /api/v1/listings should filter by city=Jaipur', async () => {
      const res = await request(app).get('/api/v1/listings?city=Jaipur');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      res.body.data.forEach((item) => {
        expect(item.serviceableCities).toContain('Jaipur');
      });
    });

    it('GET /api/v1/listings should filter by price range', async () => {
      const res = await request(app).get('/api/v1/listings?minPrice=5000&maxPrice=30000');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      res.body.data.forEach((item) => {
        expect(item.pricing.basePrice).toBeGreaterThanOrEqual(5000);
        expect(item.pricing.basePrice).toBeLessThanOrEqual(30000);
      });
    });

    it('GET /api/v1/listings should return structured pagination metadata', async () => {
      const res = await request(app).get('/api/v1/listings?limit=2&page=1');

      expect(res.status).toBe(200);
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(2);
      expect(res.body.meta.total).toBeGreaterThanOrEqual(3);
      expect(res.body.meta.totalPages).toBeGreaterThanOrEqual(2);
    });

    it('GET /api/v1/listings should perform keyword search', async () => {
      const res = await request(app).get('/api/v1/listings?search=Rolls-Royce');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].title).toContain('Rolls-Royce');
    });
  });

  describe('Media Upload Integration', () => {
    it('POST /api/v1/media/upload should upload image buffer with stream handling', async () => {
      const dummyBuffer = Buffer.from('fake-jpeg-image-bytes-shaadisaathi');

      const res = await request(app)
        .post('/api/v1/media/upload')
        .set('Authorization', `Bearer ${vendor1Token}`)
        .attach('file', dummyBuffer, 'mandap_decor.jpg');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.url).toBeDefined();
      expect(res.body.data.publicId).toBeDefined();
      expect(res.body.data.mimetype).toBe('image/jpeg');
    });

    it('POST /api/v1/media/upload should reject unauthenticated requests', async () => {
      const dummyBuffer = Buffer.from('fake-jpeg');

      const res = await request(app)
        .post('/api/v1/media/upload')
        .attach('file', dummyBuffer, 'test.jpg');

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('AUTH_REQUIRED');
    });
  });
});
