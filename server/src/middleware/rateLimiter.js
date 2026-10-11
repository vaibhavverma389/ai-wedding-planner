import rateLimit from 'express-rate-limit';
import { sendError } from '../utils/response.js';

// General API Rate Limiter: 100 requests per 15 minutes in production
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 10000 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(
      res,
      'Too many requests from this IP, please try again after 15 minutes',
      429,
      'RATE_LIMIT_EXCEEDED'
    );
  }
});

// Stricter Rate Limiter for Authentication endpoints (prevent brute-force)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 10000 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(
      res,
      'Too many authentication attempts. Please wait 15 minutes before trying again.',
      429,
      'AUTH_RATE_LIMIT_EXCEEDED'
    );
  }
});
