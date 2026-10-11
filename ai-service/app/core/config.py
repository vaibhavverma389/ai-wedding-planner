import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "ShaadiSaathi AI Service"
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    DEBUG: bool = True
    
    # Internal auth key shared between Express backend and FastAPI
    INTERNAL_SERVICE_KEY: str = "shaadisaathi_internal_ai_secret_key_2026_xyz"
    
    # Paths
    MODEL_PATH: str = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models", "budget_pipeline_v1.joblib")
    DATASET_PATH: str = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "wedding_budget_dataset.csv")
    
    # LLM Settings
    LLM_PROVIDER: str = "mock"
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    LLM_MODEL: str = "gemini-1.5-flash"

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
