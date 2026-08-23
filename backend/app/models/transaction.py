from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal

class Transaction(SQLModel, table=True):
    __tablename__ = "transactions"

    id: str = Field(primary_key=True, max_length=64, index=True)
    timestamp: datetime = Field(index=True)
    merchant: str = Field(max_length=255, index=True)
    category: Optional[str] = Field(default=None, max_length=100, index=True, nullable=True)
    amount: Decimal = Field(decimal_places=2, max_digits=14, index=True)
    currency: str = Field(default="INR", max_length=10)
    status: str = Field(max_length=50, index=True)
    payment_method: str = Field(max_length=100, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
