from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from decimal import Decimal

class TransactionRead(BaseModel):
    id: str
    timestamp: datetime
    merchant: str
    category: Optional[str] = None
    amount: Decimal
    currency: str
    status: str
    payment_method: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TransactionFilterParams(BaseModel):
    search: Optional[str] = None
    category: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    min_amount: Optional[Decimal] = None
    max_amount: Optional[Decimal] = None
    payment_status: Optional[str] = None
    sort_by: Optional[str] = Field(default="timestamp", description="Allowed: timestamp, amount")
    sort_order: Optional[str] = Field(default="desc", description="Allowed: asc, desc")
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=25, ge=1, le=200)
