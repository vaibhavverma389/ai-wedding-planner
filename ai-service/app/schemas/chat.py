from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

class ChatMessage(BaseModel):
    role: str = Field(..., description="'user', 'assistant', or 'system'")
    content: str = Field(..., description="Message text")

class AuthorizedContext(BaseModel):
    userName: Optional[str] = "Customer"
    userRole: Optional[str] = "customer"
    activeWeddingEvent: Optional[Dict[str, Any]] = None
    recentOrders: Optional[List[Dict[str, Any]]] = None
    featuredListings: Optional[List[Dict[str, Any]]] = None
    platformPolicies: Optional[Dict[str, str]] = None

class ChatRagRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    history: List[ChatMessage] = Field(default=[])
    context: AuthorizedContext = Field(default_factory=AuthorizedContext)

class ChatCitation(BaseModel):
    sourceType: str
    title: str
    referenceId: Optional[str] = None

class ChatRagResponse(BaseModel):
    reply: str
    citations: List[ChatCitation]
    suggestedListings: List[Dict[str, Any]] = []
    confidence: str = "HIGH"
    isFallback: bool = False
