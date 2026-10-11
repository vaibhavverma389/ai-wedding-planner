import { z } from 'zod';
import { aiClientService } from '../services/aiClientService.js';
import Listing from '../models/Listing.js';
import Event from '../models/Event.js';
import { sendSuccess } from '../utils/response.js';

// Validation Schemas
const budgetPredictionSchema = z.object({
  city: z.string().min(2),
  guestCount: z.coerce.number().min(10).max(5000),
  functionCount: z.coerce.number().min(1).max(10).default(3),
  venueType: z.string().default('banquet_hall'),
  cateringPreference: z.string().default('standard_nonveg'),
  decorationLevel: z.string().default('traditional'),
  photographyPackage: z.string().default('cinematic_drone'),
  eventDurationDays: z.coerce.number().min(1).max(7).default(2)
});

const recommendationQuerySchema = z.object({
  budget: z.coerce.number().positive(),
  city: z.string().min(2),
  categories: z.array(z.string()).optional(),
  transactionType: z.enum(['rent', 'buy_new', 'buy_used', 'service']).optional()
});

const plannerSchema = z.object({
  totalBudget: z.coerce.number().min(10000),
  city: z.string().min(2),
  weddingDates: z.array(z.string()).default([]),
  guestCount: z.coerce.number().min(10).max(5000).default(300),
  functions: z.array(z.string()).default(['Mehendi', 'Sangeet', 'Wedding', 'Reception']),
  preferences: z.array(z.string()).default(['royal', 'traditional'])
});

const chatSchema = z.object({
  message: z.string().min(1).max(1000),
  history: z.array(z.object({
    role: z.string(),
    content: z.string()
  })).optional().default([])
});

const themeSchema = z.object({
  prompt: z.string().min(2),
  preferredCity: z.string().optional(),
  targetBudget: z.coerce.number().optional()
});

const cateringSchema = z.object({
  totalInvited: z.coerce.number().min(10).max(5000),
  confirmedRsvpCount: z.coerce.number().optional(),
  eventMealType: z.string().default('dinner'),
  menuTier: z.string().default('standard_fusion'),
  hasLiquorCounter: z.boolean().default(false)
});

export const predictWeddingBudget = async (req, res) => {
  const validated = budgetPredictionSchema.parse(req.body);
  const result = await aiClientService.predictBudget(validated);
  return sendSuccess(res, result, 'Wedding budget prediction generated successfully');
};

export const getVendorRecommendations = async (req, res) => {
  const validated = recommendationQuerySchema.parse(req.body);

  // Query actual active database listings to supply to the recommendation engine
  const query = { isActive: true };
  if (validated.transactionType) query.transactionType = validated.transactionType;

  const listings = await Listing.find(query)
    .populate('category', 'name slug')
    .limit(40)
    .lean();

  const formattedListings = listings.map((l) => ({
    id: l._id.toString(),
    title: l.title,
    category: l.category?.name || 'General',
    transactionType: l.transactionType,
    price: l.price,
    city: l.city || 'Pan India',
    rating: l.rating?.average || 0,
    reviewCount: l.rating?.count || 0,
    images: l.images?.map((img) => img.url) || [],
    isAvailable: (l.inventory?.availableQuantity ?? 1) > 0
  }));

  const result = await aiClientService.getRecommendations({
    ...validated,
    availableListings: formattedListings
  });

  return sendSuccess(res, result, 'Vendor recommendations retrieved successfully');
};

export const generateWeddingPlan = async (req, res) => {
  const validated = plannerSchema.parse(req.body);
  const result = await aiClientService.generateWeddingPlan(validated);
  return sendSuccess(res, result, 'Personalized wedding plan generated successfully');
};

export const chatWithAiAssistant = async (req, res) => {
  const validated = chatSchema.parse(req.body);

  // Retrieve user authorized context if authenticated
  let activeEvent = null;
  if (req.user) {
    activeEvent = await Event.findOne({ customer: req.user._id }).sort({ createdAt: -1 }).lean();
  }

  const context = {
    userName: req.user?.name || 'Guest',
    userRole: req.user?.role || 'customer',
    activeWeddingEvent: activeEvent ? {
      _id: activeEvent._id.toString(),
      title: activeEvent.title,
      totalBudget: activeEvent.totalBudget,
      actualSpent: activeEvent.budgetLines?.reduce((sum, b) => sum + (b.actualCost || 0), 0) || 0
    } : null
  };

  const result = await aiClientService.chatRag({
    message: validated.message,
    history: validated.history,
    context
  });

  return sendSuccess(res, result, 'AI assistant response generated');
};

export const discoverWeddingTheme = async (req, res) => {
  const validated = themeSchema.parse(req.body);
  const result = await aiClientService.discoverTheme(validated);
  return sendSuccess(res, result, 'Wedding theme discovered successfully');
};

export const estimateCatering = async (req, res) => {
  const validated = cateringSchema.parse(req.body);
  const result = await aiClientService.estimateCatering(validated);
  return sendSuccess(res, result, 'Catering requirements estimated successfully');
};

export const getVendorDemandForecast = async (req, res) => {
  const city = req.query.city || 'Delhi NCR';
  const category = req.query.category || 'Photography & Cinematography';
  const result = await aiClientService.forecastDemand(city, category);
  return sendSuccess(res, result, 'Vendor demand forecast retrieved successfully');
};
