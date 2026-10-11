import { env } from '../config/environment.js';
import logger from '../utils/logger.js';

class AiClientService {
  constructor() {
    this.baseUrl = env.AI_SERVICE_URL;
    this.serviceKey = env.AI_SERVICE_KEY;
    this.timeoutMs = 4000; // 4 second non-blocking budget
  }

  /**
   * Internal authenticated HTTP dispatcher to FastAPI
   */
  async _fetchAi(endpoint, method = 'POST', body = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Service-Key': this.serviceKey
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });

      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`AI Microservice responded with status ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      clearTimeout(timer);
      logger.warn(`⚠️ AI Microservice unavailable (${endpoint}): ${err.message}. Engaging resilient fallback.`);
      return null;
    }
  }

  /**
   * 1. Machine Learning Wedding Budget Predictor
   */
  async predictBudget(params) {
    const aiResponse = await this._fetchAi('/predict/wedding-budget', 'POST', params);
    if (aiResponse) return { ...aiResponse, isFallback: false };

    // Built-in resilient fallback benchmark
    const cityMultipliers = {
      mumbai: 1.45,
      'delhi ncr': 1.40,
      bengaluru: 1.30,
      jaipur: 1.35,
      hyderabad: 1.25,
      kolkata: 1.15,
      pune: 1.20,
      lucknow: 1.10,
      chennai: 1.15,
      goa: 1.50
    };

    const venueCosts = {
      community_hall: 150000,
      farmhouse: 450000,
      banquet_hall: 650000,
      luxury_hotel: 1600000,
      palace: 3500000
    };

    const cateringPerGuest = {
      pure_veg: 1200,
      standard_nonveg: 1800,
      premium_gourmet: 2800
    };

    const decorCosts = {
      minimal: 150000,
      traditional: 350000,
      royal_luxury: 950000
    };

    const photoCosts = {
      basic_candid: 120000,
      cinematic_drone: 280000,
      celebrity_tier: 650000
    };

    const cityKey = (params.city || 'delhi ncr').trim().toLowerCase();
    const cityMult = cityMultipliers[cityKey] || 1.20;
    const days = params.eventDurationDays || 2;
    const functions = params.functionCount || 3;
    const guests = params.guestCount || 300;

    const venueBase = (venueCosts[params.venueType] || 650000) * days * 0.7;
    const cateringTotal = (cateringPerGuest[params.cateringPreference] || 1800) * guests * functions * 0.65;
    const decorTotal = (decorCosts[params.decorationLevel] || 350000) * functions * 0.8;
    const photoTotal = (photoCosts[params.photographyPackage] || 280000) * (1 + (days - 1) * 0.4);
    const attireJewellery = Math.max(200000, (cateringTotal + venueBase) * 0.18);
    const misc = Math.max(100000, (decorTotal + photoTotal) * 0.15);

    const rawTotal = (venueBase + cateringTotal + decorTotal + photoTotal + attireJewellery + misc) * cityMult;
    const estimated = Math.round(rawTotal / 1000) * 1000;

    return {
      estimatedAmount: estimated,
      lowerBound: Math.round((estimated * 0.88) / 100) * 100,
      upperBound: Math.round((estimated * 1.15) / 100) * 100,
      currency: 'INR',
      modelVersion: 'v1.0-BenchmarkRuleBaseline',
      isSyntheticData: true,
      inputSummary: params,
      breakdown: {
        venueAndCatering: Math.round(estimated * 0.48),
        decorAndProduction: Math.round(estimated * 0.20),
        photographyAndMedia: Math.round(estimated * 0.12),
        attireAndJewellery: Math.round(estimated * 0.14),
        entertainmentAndMisc: Math.round(estimated * 0.06)
      },
      disclaimer: 'Generated via ShaadiSaathi statistical benchmark baseline (Synthetic model calibration).',
      isFallback: true
    };
  }

  /**
   * 2. Personalized Vendor Recommendations
   */
  async getRecommendations(params) {
    const aiResponse = await this._fetchAi('/recommendations/vendors', 'POST', params);
    if (aiResponse) return { ...aiResponse, isFallback: false };

    // Built-in resilient fallback ranking
    const targetCity = (params.city || '').toLowerCase();
    const scored = (params.availableListings || [])
      .filter((item) => item.isAvailable !== false)
      .map((item) => {
        let score = 50;
        const reasons = [];

        if (item.city && item.city.toLowerCase().includes(targetCity)) {
          score += 25;
          reasons.push(`Available in your wedding city (${item.city})`);
        }
        if (item.price <= params.budget) {
          score += 20;
          reasons.push(`Budget match at ₹${item.price.toLocaleString('en-IN')}`);
        }
        if (item.rating >= 4.5) {
          score += 15;
          reasons.push(`Top-rated vendor (${item.rating} ★)`);
        }

        return {
          listingId: item.id || item._id,
          title: item.title,
          category: item.category,
          transactionType: item.transactionType,
          price: item.price,
          score,
          matchPercentage: Math.min(99, Math.max(50, score)),
          reasons: reasons.length ? reasons : ['Verified marketplace listing'],
          badge: score >= 85 ? 'Top Match' : null
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);

    return {
      totalEvaluated: params.availableListings ? params.availableListings.length : 0,
      recommendations: scored,
      appliedFilters: { city: params.city, budget: params.budget },
      explanation: 'Ranked using ShaadiSaathi direct availability, city proximity, and budget alignment.',
      isFallback: true
    };
  }

  /**
   * 3. AI Wedding Planner
   */
  async generateWeddingPlan(params) {
    const aiResponse = await this._fetchAi('/planner/generate-plan', 'POST', params);
    if (aiResponse) return { ...aiResponse, isFallback: false };

    const budget = params.totalBudget || 2000000;
    return {
      planTitle: `Grand ${params.city || 'Wedding'} Master Blueprint`,
      totalBudget: budget,
      city: params.city,
      guestCount: params.guestCount || 300,
      timeline: [
        {
          monthRange: '9 - 12 Months Out',
          phase: 'Vision, Budget & Venue Booking',
          keyActions: [
            `Lock overall budget of ₹${budget.toLocaleString('en-IN')}.`,
            `Book primary wedding venue in ${params.city}.`,
            'Lock candid wedding photographer.'
          ]
        },
        {
          monthRange: '6 - 8 Months Out',
          phase: 'Vendor Locking & Themes',
          keyActions: [
            'Confirm caterer and tasting menu.',
            'Finalize decor concepts for Mandap and Sangeet.',
            'Book bridal mehndi & makeup artists.'
          ]
        },
        {
          monthRange: '3 - 5 Months Out',
          phase: 'Wardrobe & Logistics',
          keyActions: [
            'Reserve bridal lehenga and groom sherwani rentals.',
            'Book Sound & DJ setup for Sangeet.',
            'Send formal digital invitations.'
          ]
        },
        {
          monthRange: '1 - 2 Months Out',
          phase: 'Final Rehearsals & Headcount',
          keyActions: [
            'Reconcile confirmed guest RSVPs in Wedding Planner.',
            'Finalize bridal entry songs and choreography.'
          ]
        }
      ],
      functionBudget: [
        { functionName: 'Wedding & Pheras', allocatedPercentage: 35, allocatedAmount: Math.round(budget * 0.35), suggestedCategories: ['Banquets & Farmhouses', 'Decor & Floral Setup'] },
        { functionName: 'Reception Dinner', allocatedPercentage: 25, allocatedAmount: Math.round(budget * 0.25), suggestedCategories: ['Banquets & Farmhouses', 'Sound & DJ Setup'] },
        { functionName: 'Sangeet & Cocktail', allocatedPercentage: 18, allocatedAmount: Math.round(budget * 0.18), suggestedCategories: ['Sound & DJ Setup', 'Bridal & Groom Wear'] },
        { functionName: 'Mehendi & Haldi', allocatedPercentage: 12, allocatedAmount: Math.round(budget * 0.12), suggestedCategories: ['Mehndi & Makeup Artists', 'Decor & Floral Setup'] },
        { functionName: 'Pre-Wedding Media', allocatedPercentage: 10, allocatedAmount: Math.round(budget * 0.10), suggestedCategories: ['Photography & Cinematography'] }
      ],
      checklist: [
        { category: 'Venue', title: 'Sign contract for wedding banquet', priority: 'HIGH', timelinePhase: '12-9 Months' },
        { category: 'Photography', title: 'Confirm 2-day candid photo package', priority: 'HIGH', timelinePhase: '12-9 Months' },
        { category: 'Decor', title: 'Finalize floral Mandap 3D render', priority: 'HIGH', timelinePhase: '6-8 Months' },
        { category: 'Attire', title: 'Reserve bridal rental lehenga hold', priority: 'MEDIUM', timelinePhase: '3-5 Months' }
      ],
      budgetSavingTips: [
        { area: 'Bridal Attire', recommendation: 'Rent designer bridal lehengas instead of purchasing retail.', potentialSavingsEstimate: 'Save up to ₹2,50,000' },
        { area: 'Floral Decor', recommendation: 'Blend seasonal marigolds with reusable silk draping for Haldi.', potentialSavingsEstimate: 'Save up to ₹80,000' }
      ],
      recommendedMarketplaceCategories: ['Banquets & Farmhouses', 'Decor & Floral Setup', 'Photography & Cinematography', 'Bridal & Groom Wear', 'Mehndi & Makeup Artists'],
      disclaimer: 'ShaadiSaathi AI wedding plans are advisory. Bookings are executed directly with verified vendors.',
      isFallback: true
    };
  }

  /**
   * 4. AI Wedding Assistant with RAG
   */
  async chatRag(params) {
    const aiResponse = await this._fetchAi('/chat/rag', 'POST', params);
    if (aiResponse) return { ...aiResponse, isFallback: false };

    const msg = (params.message || '').toLowerCase();
    let reply = `Hello! I am your ShaadiSaathi AI wedding concierge. You can ask me about budget planning, rental terms, vendor categories, or discovering equipment.`;
    const citations = [{ sourceType: 'Platform Policy', title: 'ShaadiSaathi Customer FAQ' }];

    if (msg.includes('rent') || msg.includes('deposit')) {
      reply = `All rental items on ShaadiSaathi include a 15-minute checkout hold to prevent double-booking. Security deposits are fully refunded upon return inspection after your event.`;
      citations.push({ sourceType: 'Rental Policy', title: 'Security Deposit Terms' });
    } else if (msg.includes('budget') || msg.includes('cost')) {
      reply = `You can use our ML Budget Predictor to estimate expenses across venues, catering, and decor based on your guest count and city.`;
      citations.push({ sourceType: 'Planning Engine', title: 'Wedding Budget Predictor' });
    }

    return {
      reply,
      citations,
      suggestedListings: [],
      confidence: 'HIGH',
      isFallback: true
    };
  }

  /**
   * 5. AI Theme Discovery
   */
  async discoverTheme(params) {
    const aiResponse = await this._fetchAi('/theme/discover', 'POST', params);
    if (aiResponse) return { ...aiResponse, isFallback: false };

    return {
      themeName: 'Royal Rajputana Heritage',
      description: 'Opulent palace aesthetics inspired by royal Rajasthan, featuring deep maroon, heritage gold, and handcrafted brass urlis.',
      palette: [
        { name: 'Royal Maroon', hex: '#881337' },
        { name: 'Heritage Gold', hex: '#D97706' },
        { name: 'Raw Silk Cream', hex: '#FEF3C7' }
      ],
      recommendedDecorElements: ['Brass Urli with floating petals', 'Grand Jharokha Mandap', 'Fairy light canopies'],
      suggestedAttireStyles: ['Velvet Zardozi Lehenga', 'Raw Silk Achkan & Safa'],
      suggestedKeywords: ['Royal', 'Heritage', 'Palace', 'Mandap'],
      disclaimer: 'Aesthetic theme recommendations.',
      isFallback: true
    };
  }

  /**
   * 6. Guest & Catering Estimation
   */
  async estimateCatering(params) {
    const aiResponse = await this._fetchAi('/catering/estimate', 'POST', params);
    if (aiResponse) return { ...aiResponse, isFallback: false };

    const total = params.totalInvited || 300;
    const recommended = Math.round(total * 0.82);
    const perPlate = 1650;
    return {
      totalInvited: total,
      expectedAttendanceRange: { minExpected: Math.round(total * 0.65), maxExpected: Math.round(total * 0.85) },
      recommendedPlateCount: recommended,
      bufferPercentage: 10,
      estimatedPerPlateCost: perPlate,
      estimatedTotalCateringBudget: recommended * perPlate,
      packageOptions: [
        { tier: 'North Indian & Continental Fusion', pricePerPlateEstimate: 1650, courseBreakdown: { Starters: 6, Mains: 10, Desserts: 6 }, features: ['Veg & Non-Veg separation', 'Live pasta & pizza counter'] }
      ],
      calculationMethod: 'Deterministic attendance model with 10% buffer',
      isFallback: true
    };
  }

  /**
   * 7. Vendor Demand Forecasting
   */
  async forecastDemand(city = 'Delhi NCR', category = 'Photography & Cinematography') {
    const aiResponse = await this._fetchAi(`/forecast/vendor-demand?city=${encodeURIComponent(city)}&category=${encodeURIComponent(category)}`, 'GET');
    if (aiResponse) return { ...aiResponse, isFallback: false };

    return {
      city,
      category,
      seasonYear: 2026,
      overallMarketTrend: 'STRONG_EXPANSION',
      monthlyProjections: [
        { month: 'October', bookingIndex: 0.80, demandIntensity: 'HIGH', peakCategory: 'Mehendi & Decor' },
        { month: 'November', bookingIndex: 1.00, demandIntensity: 'PEAK', peakCategory: 'All Categories' },
        { month: 'December', bookingIndex: 0.98, demandIntensity: 'PEAK', peakCategory: 'All Categories' },
        { month: 'January', bookingIndex: 0.95, demandIntensity: 'PEAK', peakCategory: 'Banquets & Decor' },
        { month: 'February', bookingIndex: 0.90, demandIntensity: 'PEAK', peakCategory: 'Photography' }
      ],
      pricingRecommendation: 'Apply 15-20% peak season pricing for November-February auspicious muhurat dates.',
      dataCoverageNote: 'Forecast generated via seasonal Indian wedding calendar indices.',
      isFallback: true
    };
  }
}

export const aiClientService = new AiClientService();
