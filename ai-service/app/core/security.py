from fastapi import HTTPException, Security, status
from fastapi.security import APIKeyHeader
from app.core.config import settings

API_KEY_HEADER = APIKeyHeader(name="X-Internal-Service-Key", auto_error=False)

async def verify_service_key(api_key: str = Security(API_KEY_HEADER)):
    """
    Validates that the incoming request originated from the authorized
    Express.js backend using the shared internal service secret.
    """
    if not api_key or api_key != settings.INTERNAL_SERVICE_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: Invalid or missing internal service key.",
            headers={"WWW-Authenticate": "ApiKey"},
        )
    return api_key
