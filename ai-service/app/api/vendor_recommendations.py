from fastapi import APIRouter, Depends
from app.api.deps import verify_service_key
from app.schemas.recommendation import RecommendationRequest, RecommendationResponse
from app.services.recommendation_service import rank_vendor_listings

router = APIRouter(tags=["Recommendations"])

@router.post("/recommendations/vendors", response_model=RecommendationResponse)
def handle_vendor_recommendations(
    req: RecommendationRequest,
    _auth: str = Depends(verify_service_key)
):
    return rank_vendor_listings(req)
