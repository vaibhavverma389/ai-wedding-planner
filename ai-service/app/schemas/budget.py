from typing import Dict, Optional
from pydantic import BaseModel, Field

class BudgetPredictionRequest(BaseModel):
    city: str = Field(..., description="Wedding host city (e.g. Delhi NCR, Jaipur, Mumbai)")
    guestCount: int = Field(..., ge=10, le=5000, description="Estimated total wedding attendees")
    functionCount: int = Field(default=3, ge=1, le=10, description="Number of wedding functions/ceremonies")
    venueType: str = Field(default="banquet_hall", description="Venue class (palace, luxury_hotel, banquet_hall, farmhouse, community_hall)")
    cateringPreference: str = Field(default="standard_nonveg", description="Catering tier (pure_veg, standard_nonveg, premium_gourmet)")
    decorationLevel: str = Field(default="traditional", description="Decoration scale (minimal, traditional, royal_luxury)")
    photographyPackage: str = Field(default="cinematic_drone", description="Coverage tier (basic_candid, cinematic_drone, celebrity_tier)")
    eventDurationDays: int = Field(default=2, ge=1, le=7, description="Number of event days")

class BudgetBreakdown(BaseModel):
    venueAndCatering: float
    decorAndProduction: float
    photographyAndMedia: float
    attireAndJewellery: float
    entertainmentAndMisc: float

class BudgetPredictionResponse(BaseModel):
    estimatedAmount: float
    lowerBound: float
    upperBound: float
    currency: str = "INR"
    modelVersion: str
    isSyntheticData: bool
    inputSummary: Dict[str, str | int]
    breakdown: BudgetBreakdown
    disclaimer: str
