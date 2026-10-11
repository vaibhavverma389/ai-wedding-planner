from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class AvailableListingItem(BaseModel):
    id: str
    title: str
    category: str
    transactionType: str
    price: float
    city: str
    rating: float = 0.0
    reviewCount: int = 0
    securityDeposit: Optional[float] = 0.0
    images: List[str] = []
    vendorId: Optional[str] = None
    isAvailable: bool = True

class RecommendationRequest(BaseModel):
    budget: float = Field(..., gt=0, description="Total or category-specific customer budget in INR")
    city: str = Field(..., description="Target event city")
    eventDates: Optional[List[str]] = Field(default=[], description="Dates of functions (YYYY-MM-DD)")
    categories: Optional[List[str]] = Field(default=[], description="Preferred category names or IDs")
    transactionType: Optional[str] = Field(default=None, description="rent, buy_new, buy_used, or service")
    availableListings: List[AvailableListingItem] = Field(..., description="Active database listings filtered for availability")

class RecommendationItem(BaseModel):
    listingId: str
    title: str
    category: str
    transactionType: str
    price: float
    score: float
    matchPercentage: int
    reasons: List[str]
    badge: Optional[str] = None

class RecommendationResponse(BaseModel):
    totalEvaluated: int
    recommendations: List[RecommendationItem]
    appliedFilters: Dict[str, Any]
    explanation: str
