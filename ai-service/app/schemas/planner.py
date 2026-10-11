from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

class PlannerRequest(BaseModel):
    totalBudget: float = Field(..., gt=10000, description="Overall wedding budget in INR")
    city: str = Field(..., description="Wedding host city")
    weddingDates: List[str] = Field(..., description="Array of ISO dates for the wedding functions")
    guestCount: int = Field(default=300, ge=10, le=5000)
    functions: List[str] = Field(default=["Mehendi", "Sangeet", "Haldi", "Wedding", "Reception"])
    preferences: List[str] = Field(default=["royal", "traditional", "cinematic"])
    catalogSummary: Optional[List[Dict[str, Any]]] = Field(default=[])

class TimelineMilestone(BaseModel):
    monthRange: str
    phase: str
    keyActions: List[str]

class FunctionBudgetAllocation(BaseModel):
    functionName: str
    allocatedPercentage: float
    allocatedAmount: float
    suggestedCategories: List[str]

class ChecklistTask(BaseModel):
    category: str
    title: str
    priority: str
    timelinePhase: str

class SavingSuggestion(BaseModel):
    area: str
    recommendation: str
    potentialSavingsEstimate: str

class PlannerResponse(BaseModel):
    planTitle: str
    totalBudget: float
    city: str
    guestCount: int
    timeline: List[TimelineMilestone]
    functionBudget: List[FunctionBudgetAllocation]
    checklist: List[ChecklistTask]
    budgetSavingTips: List[SavingSuggestion]
    recommendedMarketplaceCategories: List[str]
    disclaimer: str
