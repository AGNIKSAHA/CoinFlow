from fastapi import APIRouter, Depends, Query
from sqlmodel import Session
from typing import Optional
from datetime import datetime
from decimal import Decimal
from app.core.db import get_db
from app.schemas.transaction import TransactionFilterParams, TransactionRead
from app.schemas.common import PaginatedResponse, ApiResponse
from app.services.transaction_service import TransactionService

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.get("", response_model=PaginatedResponse[TransactionRead])
def get_transactions(
    search: Optional[str] = Query(None, description="Search merchant name"),
    category: Optional[str] = Query(None, description="Category filter"),
    start_date: Optional[datetime] = Query(None, description="Start date ISO"),
    end_date: Optional[datetime] = Query(None, description="End date ISO"),
    min_amount: Optional[Decimal] = Query(None, description="Min amount"),
    max_amount: Optional[Decimal] = Query(None, description="Max amount"),
    payment_status: Optional[str] = Query(None, description="Status (SUCCESS, FAILED, PENDING)"),
    sort_by: Optional[str] = Query("timestamp", description="Sort by timestamp or amount"),
    sort_order: Optional[str] = Query("desc", description="Sort asc or desc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=200),
    db: Session = Depends(get_db)
):
    params = TransactionFilterParams(
        search=search,
        category=category,
        start_date=start_date,
        end_date=end_date,
        min_amount=min_amount,
        max_amount=max_amount,
        payment_status=payment_status,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        page_size=page_size
    )
    service = TransactionService(db)
    return service.get_transactions(params)

@router.get("/{transaction_id}", response_model=ApiResponse[TransactionRead])
def get_transaction_by_id(
    transaction_id: str,
    db: Session = Depends(get_db)
):
    service = TransactionService(db)
    return service.get_transaction_detail(transaction_id)
