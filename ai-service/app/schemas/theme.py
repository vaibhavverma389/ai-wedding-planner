from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ThemeDiscoveryRequest(BaseModel):
    prompt: str = Field(..., description="Natural language theme description (e.g. Royal Rajasthani, Pastel Floral)")
    preferredCity: Optional[str] = None
    targetBudget: Optional[float] = None

class ThemeColorPalette(BaseModel):
    name: str
    hex: str

class ThemeDiscoveryResponse(BaseModel):
    themeName: str
    description: str
    palette: List[ThemeColorPalette]
    recommendedDecorElements: List[str]
    suggestedAttireStyles: List[str]
    suggestedKeywords: List[str]
    disclaimer: str = "AI-generated aesthetic recommendations. Actual vendor offerings and inventory may vary."
