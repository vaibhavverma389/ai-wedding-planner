import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Health & Routing Endpoints', () => {
  it('GET /api/v1/health should return 200 with service operational status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
    expect(res.body.message).toContain('ShaadiSaathi API');
  });

  it('GET /api/v1/unknown-route should return 404 with structured error envelope', async () => {
    const res = await request(app).get('/api/v1/unknown-route');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('ROUTE_NOT_FOUND');
  });
});
