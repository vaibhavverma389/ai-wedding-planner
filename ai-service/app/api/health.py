import os
from fastapi import APIRouter
from app.core.config import settings

router = APIRouter(tags=["Health"])

@router.get("/health")
def get_health_status():
    model_exists = os.path.exists(settings.MODEL_PATH)
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "environment": settings.ENVIRONMENT,
        "modelsLoaded": model_exists,
        "features": {
            "budgetPrediction": True,
            "vendorRecommendations": True,
            "weddingPlanner": True,
            "chatbotRAG": True,
            "themeDiscovery": True,
            "cateringEstimation": True,
            "vendorDemandForecasting": True
        }
    }
