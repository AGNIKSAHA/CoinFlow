from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.core.db import get_db
from app.schemas.analytics import CategorySpendResponse, MonthlySpendResponse
from app.schemas.common import ApiResponse
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/category", response_model=ApiResponse[CategorySpendResponse])
def get_category_analytics(db: Session = Depends(get_db)):
    service = AnalyticsService(db)
    return service.get_category_analytics()

@router.get("/monthly", response_model=ApiResponse[MonthlySpendResponse])
def get_monthly_analytics(db: Session = Depends(get_db)):
    service = AnalyticsService(db)
    return service.get_monthly_analytics()
