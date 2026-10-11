import os
import joblib
from app.schemas.budget import BudgetPredictionRequest, BudgetPredictionResponse, BudgetBreakdown
from app.core.config import settings

# In-memory cached pipeline
_cached_pipeline = None

def load_pipeline():
    global _cached_pipeline
    if _cached_pipeline is not None:
        return _cached_pipeline
    
    if os.path.exists(settings.MODEL_PATH):
        try:
            _cached_pipeline = joblib.load(settings.MODEL_PATH)
            return _cached_pipeline
        except Exception:
            return None
    return None

def predict_wedding_budget(req: BudgetPredictionRequest) -> BudgetPredictionResponse:
    """
    Predicts wedding budget using the trained scikit-learn regression pipeline.
    Falls back to a transparent deterministic domain benchmark if the serialized
    model is not yet generated.
    """
    pipeline = load_pipeline()
    
    # Base coefficients for Indian Wedding expense tiers
    city_multipliers = {
        "mumbai": 1.45,
        "delhi ncr": 1.40,
        "bengaluru": 1.30,
        "jaipur": 1.35,
        "hyderabad": 1.25,
        "kolkata": 1.15,
        "pune": 1.20,
        "lucknow": 1.10,
        "chennai": 1.15,
        "goa": 1.50
    }
    
    venue_tier_costs = {
        "community_hall": 150000,
        "farmhouse": 450000,
        "banquet_hall": 650000,
        "luxury_hotel": 1600000,
        "palace": 3500000
    }
    
    catering_costs_per_guest = {
        "pure_veg": 1200,
        "standard_nonveg": 1800,
        "premium_gourmet": 2800
    }
    
    decor_tier_costs = {
        "minimal": 150000,
        "traditional": 350000,
        "royal_luxury": 950000
    }
    
    photo_tier_costs = {
        "basic_candid": 120000,
        "cinematic_drone": 280000,
        "celebrity_tier": 650000
    }
    
    city_mult = city_multipliers.get(req.city.strip().lower(), 1.15)
    venue_base = venue_tier_costs.get(req.venueType.lower(), 500000) * req.eventDurationDays * 0.7
    catering_total = catering_costs_per_guest.get(req.cateringPreference.lower(), 1800) * req.guestCount * req.functionCount * 0.65
    decor_total = decor_tier_costs.get(req.decorationLevel.lower(), 350000) * req.functionCount * 0.8
    photo_total = photo_tier_costs.get(req.photographyPackage.lower(), 250000) * (1 + (req.eventDurationDays - 1) * 0.4)
    attire_jewellery = max(200000, (catering_total + venue_base) * 0.18)
    entertainment_misc = max(100000, (decor_total + photo_total) * 0.15)
    
    calculated_raw = (venue_base + catering_total + decor_total + photo_total + attire_jewellery + entertainment_misc) * city_mult
    
    # If pipeline is trained and loaded, use model inference
    if pipeline is not None:
        try:
            import pandas as pd
            df_input = pd.DataFrame([{
                "city": req.city.strip().lower(),
                "guest_count": req.guestCount,
                "function_count": req.functionCount,
                "venue_type": req.venueType.lower(),
                "catering_preference": req.cateringPreference.lower(),
                "decoration_level": req.decorationLevel.lower(),
                "photography_package": req.photographyPackage.lower(),
                "event_duration_days": req.eventDurationDays
            }])
            ml_pred = float(pipeline.predict(df_input)[0])
            predicted_amount = round(ml_pred, -3)
            model_ver = "v1.0-RandomForest"
        except Exception:
            predicted_amount = round(calculated_raw, -3)
            model_ver = "v1.0-BenchmarkRuleBaseline"
    else:
        predicted_amount = round(calculated_raw, -3)
        model_ver = "v1.0-BenchmarkRuleBaseline"
        
    lower_bound = round(predicted_amount * 0.88, -2)
    upper_bound = round(predicted_amount * 1.15, -2)
    
    # Proportionate breakdown
    breakdown = BudgetBreakdown(
        venueAndCatering=round(predicted_amount * 0.48, -2),
        decorAndProduction=round(predicted_amount * 0.20, -2),
        photographyAndMedia=round(predicted_amount * 0.12, -2),
        attireAndJewellery=round(predicted_amount * 0.14, -2),
        entertainmentAndMisc=round(predicted_amount * 0.06, -2)
    )
    
    return BudgetPredictionResponse(
        estimatedAmount=predicted_amount,
        lowerBound=lower_bound,
        upperBound=upper_bound,
        currency="INR",
        modelVersion=model_ver,
        isSyntheticData=True,
        inputSummary={
            "city": req.city,
            "guestCount": req.guestCount,
            "functionCount": req.functionCount,
            "venueType": req.venueType,
            "cateringPreference": req.cateringPreference,
            "decorationLevel": req.decorationLevel,
            "photographyPackage": req.photographyPackage,
            "eventDurationDays": req.eventDurationDays
        },
        breakdown=breakdown,
        disclaimer="Predictions are statistical benchmarks generated for planning purposes. Model v1 trained on structured synthetic wedding market data. Actual quotes depend on vendor availability and auspicious dates."
    )
