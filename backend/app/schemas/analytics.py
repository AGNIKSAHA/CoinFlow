from pydantic import BaseModel
from typing import List, Optional
from decimal import Decimal

class CategorySpendItem(BaseModel):
    category: str
    total_amount: Decimal
    transaction_count: int
    percentage: float

class CategorySpendResponse(BaseModel):
    items: List[CategorySpendItem]
    total_spend: Decimal

class MonthlySpendItem(BaseModel):
    month: str # format: YYYY-MM
    month_label: str # e.g. "Jan 2026"
    total_amount: Decimal
    transaction_count: int

class MonthlySpendResponse(BaseModel):
    items: List[MonthlySpendItem]
    total_spend: Decimal
