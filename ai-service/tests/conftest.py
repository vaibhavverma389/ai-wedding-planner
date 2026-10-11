import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def auth_headers():
    return {"X-Internal-Service-Key": settings.INTERNAL_SERVICE_KEY}
