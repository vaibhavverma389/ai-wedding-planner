from typing import List, Dict, Optional
from pydantic import BaseModel, Field

class MonthlyDemandTrend(BaseModel):
    month: str
    bookingIndex: float
    demandIntensity: str
    peakCategory: str

class VendorDemandForecastResponse(BaseModel):
    city: str
    category: str
    seasonYear: int
    overallMarketTrend: str
    monthlyProjections: List[MonthlyDemandTrend]
    pricingRecommendation: str
    dataCoverageNote: str
