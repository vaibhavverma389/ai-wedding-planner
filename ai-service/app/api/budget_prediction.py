from fastapi import APIRouter, Depends
from app.api.deps import verify_service_key
from app.schemas.budget import BudgetPredictionRequest, BudgetPredictionResponse
from app.services.budget_service import predict_wedding_budget

router = APIRouter(tags=["Budget Prediction"])

@router.post("/predict/wedding-budget", response_model=BudgetPredictionResponse)
def handle_budget_prediction(
    req: BudgetPredictionRequest,
    _auth: str = Depends(verify_service_key)
):
    return predict_wedding_budget(req)
