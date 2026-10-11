from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.api.health import router as health_router
from app.api.budget_prediction import router as budget_router
from app.api.vendor_recommendations import router as recommendation_router
from app.api.wedding_planner import router as planner_router
from app.api.chatbot_rag import router as chat_router
from app.api.theme_discovery import router as theme_router
from app.api.catering_estimation import router as catering_router
from app.api.vendor_demand import router as demand_router
from app.services.budget_service import load_pipeline

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Preload machine learning pipeline into memory
    print(f"🚀 Starting {settings.APP_NAME}...")
    pipeline = load_pipeline()
    if pipeline:
        print("✅ ML Budget Pipeline preloaded successfully into memory.")
    else:
        print("ℹ️ ML Budget Pipeline not found on disk; benchmark baseline fallback active.")
    yield
    print(f"🛑 Shutting down {settings.APP_NAME}...")

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Machine Learning, Recommendation, and AI Planning microservice for ShaadiSaathi wedding marketplace.",
    lifespan=lifespan
)

# CORS Middleware (Restricted to internal / Express gateway origin in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_AI_ERROR",
                "message": str(exc) if settings.DEBUG else "An unexpected error occurred in the AI microservice."
            }
        }
    )

# Register API Routers
app.include_router(health_router)
app.include_router(budget_router)
app.include_router(recommendation_router)
app.include_router(planner_router)
app.include_router(chat_router)
app.include_router(theme_router)
app.include_router(catering_router)
app.include_router(demand_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=settings.DEBUG)
