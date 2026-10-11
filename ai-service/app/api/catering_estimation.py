from fastapi import APIRouter, Depends
from app.api.deps import verify_service_key
from app.schemas.catering import CateringEstimationRequest, CateringEstimationResponse
from app.services.catering_service import estimate_catering_requirements

router = APIRouter(tags=["Catering Estimation"])

@router.post("/catering/estimate", response_model=CateringEstimationResponse)
def handle_catering_estimation(
    req: CateringEstimationRequest,
    _auth: str = Depends(verify_service_key)
):
    return estimate_catering_requirements(req)
