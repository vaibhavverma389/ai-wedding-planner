from fastapi import APIRouter, Depends
from app.api.deps import verify_service_key
from app.schemas.theme import ThemeDiscoveryRequest, ThemeDiscoveryResponse
from app.services.theme_service import discover_wedding_theme

router = APIRouter(tags=["Theme Discovery"])

@router.post("/theme/discover", response_model=ThemeDiscoveryResponse)
def handle_theme_discovery(
    req: ThemeDiscoveryRequest,
    _auth: str = Depends(verify_service_key)
):
    return discover_wedding_theme(req)
