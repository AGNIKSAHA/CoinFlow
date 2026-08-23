from sqlmodel import Session, select, func, col, or_
from typing import Tuple, List, Optional
from datetime import datetime
from decimal import Decimal
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionFilterParams

class TransactionRepository:
    def __init__(self, session: Session):
        self.session = session

    def get_paginated_transactions(
        self, params: TransactionFilterParams
    ) -> Tuple[List[Transaction], int]:
        query = select(Transaction)
        
        # 1. Search filter
        if params.search and params.search.strip():
            search_pattern = f"%{params.search.strip()}%"
            query = query.where(col(Transaction.merchant).ilike(search_pattern))

        # 2. Category filter
        if params.category and params.category.strip():
            cat = params.category.strip()
            if cat.lower() in ["uncategorized", "unknown", "null"]:
                query = query.where(col(Transaction.category).is_(None))
            else:
                query = query.where(col(Transaction.category) == cat)

        # 3. Date range filter
        if params.start_date:
            query = query.where(col(Transaction.timestamp) >= params.start_date)
        if params.end_date:
            query = query.where(col(Transaction.timestamp) <= params.end_date)

        # 4. Amount range filter
        if params.min_amount is not None:
            query = query.where(col(Transaction.amount) >= params.min_amount)
        if params.max_amount is not None:
            query = query.where(col(Transaction.amount) <= params.max_amount)

        # 5. Payment status filter
        if params.payment_status and params.payment_status.strip():
            query = query.where(col(Transaction.status) == params.payment_status.strip().upper())

        # Count total matching records before pagination
        count_query = select(func.count()).select_from(query.subquery())
        total = self.session.exec(count_query).one()

        # 6. Sorting with Allowlist protection
        sort_column = col(Transaction.timestamp)
        if params.sort_by == "amount":
            sort_column = col(Transaction.amount)
            
        if params.sort_order and params.sort_order.lower() == "asc":
            query = query.order_by(sort_column.asc())
        else:
            query = query.order_by(sort_column.desc())

        # 7. Server-side Pagination
        offset = (params.page - 1) * params.page_size
        query = query.offset(offset).limit(params.page_size)

        items = self.session.exec(query).all()
        return items, total

    def get_by_id(self, transaction_id: str) -> Optional[Transaction]:
        return self.session.get(Transaction, transaction_id)
