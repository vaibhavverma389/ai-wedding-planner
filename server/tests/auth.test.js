import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/database.js';
import { User } from '../src/models/User.js';
import { VendorProfile } from '../src/models/VendorProfile.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await connectDB(uri);
});

afterAll(async () => {
  await disconnectDB();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  await User.deleteMany({});
  await VendorProfile.deleteMany({});
});

describe('Authentication & Authorization Suite (Phase 2)', () => {
  const sampleCustomer = {
    name: 'Pooja Sharma',
    email: 'pooja.sharma@example.com',
    phone: '9876543210',
    password: 'SecurePassword123!',
    role: 'customer'
  };

  const sampleVendor = {
    name: 'Rajesh Mehendi Arts',
    email: 'rajesh.mehendi@example.com',
    phone: '9812345678',
    password: 'VendorPassword123!',
    role: 'vendor',
    businessName: 'Royal Rajput Mehendi',
    serviceableCities: ['Jaipur', 'Delhi NCR']
  };

  describe('POST /api/v1/auth/register', () => {
    it('should register a new customer successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(sampleCustomer);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(sampleCustomer.email.toLowerCase());
      expect(res.body.data.user.role).toBe('customer');
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.headers['set-cookie']).toBeDefined();
      expect(res.body.data.user.password).toBeUndefined(); // ensure password is not leaked
    });

    it('should register a new vendor and create linked VendorProfile', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(sampleVendor);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('vendor');
      expect(res.body.data.user.vendorProfile).toBeDefined();
      expect(res.body.data.user.vendorProfile.businessName).toBe(sampleVendor.businessName);

      // Verify in DB
      const profile = await VendorProfile.findOne({ slug: res.body.data.user.vendorProfile.slug });
      expect(profile).not.toBeNull();
      expect(profile.serviceableCities).toContain('Jaipur');
    });

    it('should reject registration if email is already taken', async () => {
      await request(app).post('/api/v1/auth/register').send(sampleCustomer);

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(sampleCustomer);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('EMAIL_EXISTS');
    });

    it('should fail validation with invalid email or short password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'A',
          email: 'not-an-email',
          phone: '123',
          password: '123'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.details.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/v1/auth/register').send(sampleCustomer);
    });

    it('should log in with valid credentials and return access token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: sampleCustomer.email,
          password: sampleCustomer.password
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe(sampleCustomer.email.toLowerCase());
    });

    it('should reject login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: sampleCustomer.email,
          password: 'WrongPassword999!'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should reject login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('Protected Endpoints & Token Lifecycle', () => {
    let customerAccessToken;
    let customerCookie;

    beforeEach(async () => {
      const registerRes = await request(app)
        .post('/api/v1/auth/register')
        .send(sampleCustomer);
      customerAccessToken = registerRes.body.data.accessToken;
      customerCookie = registerRes.headers['set-cookie'];
    });

    it('GET /api/v1/auth/me should return current user when authorized', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${customerAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(sampleCustomer.email.toLowerCase());
    });

    it('GET /api/v1/auth/me should return 401 when no token is provided', async () => {
      const res = await request(app).get('/api/v1/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('AUTH_REQUIRED');
    });

    it('POST /api/v1/auth/refresh-token should generate a new access token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh-token')
        .set('Cookie', customerCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('POST /api/v1/auth/change-password should invalidate previous refresh session', async () => {
      const changeRes = await request(app)
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${customerAccessToken}`)
        .send({
          currentPassword: sampleCustomer.password,
          newPassword: 'NewSecurePassword456!'
        });

      expect(changeRes.status).toBe(200);

      // Attempt refresh with old cookie should fail due to tokenVersion increment
      const refreshRes = await request(app)
        .post('/api/v1/auth/refresh-token')
        .set('Cookie', customerCookie);

      expect(refreshRes.status).toBe(401);
      expect(refreshRes.body.error.code).toBe('SESSION_REVOKED');
    });
  });
});
