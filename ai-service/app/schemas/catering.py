from typing import List, Dict, Optional
# pyrefly: ignore [missing-import]
from pydantic import BaseModel, Field

class CateringEstimationRequest(BaseModel):
    totalInvited: int = Field(..., ge=10, le=5000)
    confirmedRsvpCount: Optional[int] = Field(default=None)
    eventMealType: str = Field(default="dinner", description="lunch, dinner, high_tea, breakfast")
    menuTier: str = Field(default="premium", description="classic_veg, standard_fusion, royal_lavish")
    hasLiquorCounter: bool = Field(default=False)

class CateringPackage(BaseModel):
    tier: str
    pricePerPlateEstimate: float
    courseBreakdown: Dict[str, int]
    features: List[str]

class CateringEstimationResponse(BaseModel):
    totalInvited: int
    expectedAttendanceRange: Dict[str, int]
    recommendedPlateCount: int
    bufferPercentage: float
    estimatedPerPlateCost: float
    estimatedTotalCateringBudget: float
    packageOptions: List[CateringPackage]
    calculationMethod: str = "Deterministic probabilistic attendance model with 10% safety buffer"
