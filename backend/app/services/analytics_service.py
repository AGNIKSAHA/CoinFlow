from sqlmodel import Session, select, func, col, case
from app.models.transaction import Transaction
from app.schemas.analytics import (
    CategorySpendItem,
    CategorySpendResponse,
    MonthlySpendItem,
    MonthlySpendResponse
)
from app.schemas.common import ApiResponse
from decimal import Decimal
from datetime import datetime

class AnalyticsService:
    def __init__(self, session: Session):
        self.session = session

    def get_category_analytics(self) -> ApiResponse[CategorySpendResponse]:
        # Filter SUCCESS transactions with amount > 0
        cat_col = func.coalesce(Transaction.category, "Uncategorized")
        
        query = (
            select(
                cat_col.label("category"),
                func.sum(Transaction.amount).label("total_amount"),
                func.count(Transaction.id).label("transaction_count")
            )
            .where(Transaction.status == "SUCCESS")
            .where(Transaction.amount > 0)
            .group_by(cat_col)
            .order_by(func.sum(Transaction.amount).desc())
        )

        results = self.session.exec(query).all()
        
        total_spend = Decimal("0.00")
        items_raw = []
        for cat, amount, count in results:
            amt = Decimal(str(amount)) if amount is not None else Decimal("0.00")
            total_spend += amt
            items_raw.append((str(cat), amt, int(count)))

        items = []
        for cat, amt, count in items_raw:
            pct = float((amt / total_spend) * 100) if total_spend > 0 else 0.0
            items.append(
                CategorySpendItem(
                    category=cat,
                    total_amount=amt,
                    transaction_count=count,
                    percentage=round(pct, 2)
                )
            )

        return ApiResponse(
            data=CategorySpendResponse(
                items=items,
                total_spend=total_spend
            )
        )

    def get_monthly_analytics(self) -> ApiResponse[MonthlySpendResponse]:
        # Format month as YYYY-MM in PostgreSQL using to_char
        month_char = func.to_char(Transaction.timestamp, "YYYY-MM")
        
        query = (
            select(
                month_char.label("month"),
                func.sum(Transaction.amount).label("total_amount"),
                func.count(Transaction.id).label("transaction_count")
            )
            .where(Transaction.status == "SUCCESS")
            .where(Transaction.amount > 0)
            .group_by(month_char)
            .order_by(month_char.asc())
        )

        results = self.session.exec(query).all()

        total_spend = Decimal("0.00")
        items = []
        for month_str, amount, count in results:
            amt = Decimal(str(amount)) if amount is not None else Decimal("0.00")
            total_spend += amt
            
            # Format label, e.g., "2026-01" -> "Jan 2026"
            try:
                dt = datetime.strptime(str(month_str), "%Y-%m")
                label = dt.strftime("%b %Y")
            except Exception:
                label = str(month_str)
                
            items.append(
                MonthlySpendItem(
                    month=str(month_str),
                    month_label=label,
                    total_amount=amt,
                    transaction_count=int(count)
                )
            )

        return ApiResponse(
            data=MonthlySpendResponse(
                items=items,
                total_spend=total_spend
            )
        )
