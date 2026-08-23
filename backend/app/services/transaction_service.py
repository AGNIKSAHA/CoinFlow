from sqlmodel import Session
from app.repositories.transaction_repository import TransactionRepository
from app.schemas.transaction import TransactionFilterParams, TransactionRead
from app.schemas.common import PaginatedResponse, PaginationMetadata, ApiResponse
from fastapi import HTTPException, status
import math

class TransactionService:
    def __init__(self, session: Session):
        self.repo = TransactionRepository(session)

    def get_transactions(self, params: TransactionFilterParams) -> PaginatedResponse[TransactionRead]:
        items, total = self.repo.get_paginated_transactions(params)
        total_pages = math.ceil(total / params.page_size) if total > 0 else 1
        
        return PaginatedResponse(
            data=[TransactionRead.model_validate(item) for item in items],
            pagination=PaginationMetadata(
                page=params.page,
                page_size=params.page_size,
                total=total,
                total_pages=total_pages
            )
        )

    def get_transaction_detail(self, transaction_id: str) -> ApiResponse[TransactionRead]:
        item = self.repo.get_by_id(transaction_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"code": "TRANSACTION_NOT_FOUND", "message": f"Transaction '{transaction_id}' not found."}
            )
        return ApiResponse(data=TransactionRead.model_validate(item))
