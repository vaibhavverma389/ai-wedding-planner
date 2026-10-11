from fastapi import APIRouter, Depends, Query
from app.api.deps import verify_service_key
from app.schemas.demand import VendorDemandForecastResponse
from app.services.demand_service import forecast_vendor_demand

router = APIRouter(tags=["Demand Forecasting"])

@router.get("/forecast/vendor-demand", response_model=VendorDemandForecastResponse)
def handle_vendor_demand_forecast(
    city: str = Query(default="Delhi NCR"),
    category: str = Query(default="Photography & Cinematography"),
    _auth: str = Depends(verify_service_key)
):
    return forecast_vendor_demand(city, category)
