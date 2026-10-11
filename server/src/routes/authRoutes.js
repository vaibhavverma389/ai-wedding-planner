import express from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  updateProfile,
  changePassword
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema
} from '../validators/authSchemas.js';

const router = express.Router();

// Public auth routes with rate limiting
router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

// Protected user routes
router.get('/me', requireAuth, getMe);
router.patch('/profile', requireAuth, validate(updateProfileSchema), updateProfile);
router.post('/change-password', requireAuth, validate(changePasswordSchema), changePassword);

export default router;
