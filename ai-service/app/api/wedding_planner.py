from fastapi import APIRouter, Depends
from app.api.deps import verify_service_key
from app.schemas.planner import PlannerRequest, PlannerResponse
from app.services.planner_service import generate_personalized_wedding_plan

router = APIRouter(tags=["AI Planner"])

@router.post("/planner/generate-plan", response_model=PlannerResponse)
def handle_wedding_plan_generation(
    req: PlannerRequest,
    _auth: str = Depends(verify_service_key)
):
    return generate_personalized_wedding_plan(req)
