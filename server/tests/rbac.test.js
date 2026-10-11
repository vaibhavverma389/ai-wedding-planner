import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectDB, disconnectDB } from '../src/config/database.js';
import { User } from '../src/models/User.js';
import { generateAccessToken } from '../src/utils/tokens.js';
import { requireAuth } from '../src/middleware/auth.js';
import { requireRole } from '../src/middleware/roleCheck.js';
import { errorHandler } from '../src/middleware/errorHandler.js';

let mongoServer;
let testApp;
let customerToken;
let vendorToken;
let adminToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await connectDB(mongoServer.getUri());

  // Create test users
  const customer = await User.create({
    name: 'Customer Test',
    email: 'cust@test.com',
    phone: '9999999991',
    password: 'Password123!',
    role: 'customer'
  });

  const vendor = await User.create({
    name: 'Vendor Test',
    email: 'vend@test.com',
    phone: '9999999992',
    password: 'Password123!',
    role: 'vendor'
  });

  const admin = await User.create({
    name: 'Admin Test',
    email: 'admin@test.com',
    phone: '9999999993',
    password: 'Password123!',
    role: 'admin'
  });

  customerToken = generateAccessToken(customer);
  vendorToken = generateAccessToken(vendor);
  adminToken = generateAccessToken(admin);

  // Set up mock test app
  testApp = express();
  testApp.use(express.json());

  testApp.get('/vendor-only', requireAuth, requireRole('vendor'), (req, res) => {
    res.json({ success: true, message: 'Vendor access granted' });
  });

  testApp.get('/admin-only', requireAuth, requireRole('admin'), (req, res) => {
    res.json({ success: true, message: 'Admin access granted' });
  });

  testApp.get('/vendor-or-admin', requireAuth, requireRole('vendor', 'admin'), (req, res) => {
    res.json({ success: true, message: 'Privileged access granted' });
  });

  testApp.use(errorHandler);
});

afterAll(async () => {
  await disconnectDB();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('Role-Based Access Control (RBAC) Suite (Phase 2)', () => {
  it('should deny customer access to vendor-only route with 403 Forbidden', async () => {
    const res = await request(testApp)
      .get('/vendor-only')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('should allow vendor access to vendor-only route', async () => {
    const res = await request(testApp)
      .get('/vendor-only')
      .set('Authorization', `Bearer ${vendorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Vendor access granted');
  });

  it('should deny vendor access to admin-only route with 403 Forbidden', async () => {
    const res = await request(testApp)
      .get('/admin-only')
      .set('Authorization', `Bearer ${vendorToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('should allow admin access to admin-only route', async () => {
    const res = await request(testApp)
      .get('/admin-only')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Admin access granted');
  });

  it('should allow both vendor and admin on multi-role route', async () => {
    const vendorRes = await request(testApp)
      .get('/vendor-or-admin')
      .set('Authorization', `Bearer ${vendorToken}`);
    expect(vendorRes.status).toBe(200);

    const adminRes = await request(testApp)
      .get('/vendor-or-admin')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(adminRes.status).toBe(200);
  });
});
