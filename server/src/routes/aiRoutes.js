import express from 'express';
import {
  predictWeddingBudget,
  getVendorRecommendations,
  generateWeddingPlan,
  chatWithAiAssistant,
  discoverWeddingTheme,
  estimateCatering,
  getVendorDemandForecast
} from '../controllers/aiController.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

const router = express.Router();

// 1. Machine Learning Budget Predictor (Public / User-accessible)
router.post('/predict-budget', optionalAuth, predictWeddingBudget);

// 2. Personalized Vendor Recommendations (Availability-aware)
router.post('/recommendations', optionalAuth, getVendorRecommendations);

// 3. AI Wedding Planner
router.post('/generate-plan', optionalAuth, generateWeddingPlan);

// 4. AI Wedding Assistant with RAG (User context scoped)
router.post('/chat', optionalAuth, chatWithAiAssistant);

// 5. Theme Discovery
router.post('/discover-theme', optionalAuth, discoverWeddingTheme);

// 6. Catering Estimator
router.post('/estimate-catering', optionalAuth, estimateCatering);

// 7. Vendor Demand Forecasting (Vendors and Admins)
router.get(
  '/vendor-demand',
  requireAuth,
  requireRole('vendor', 'admin'),
  getVendorDemandForecast
);

export default router;
