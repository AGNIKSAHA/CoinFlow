from pydantic import BaseModel
from typing import Generic, TypeVar, List, Optional

T = TypeVar("T")

class PaginationMetadata(BaseModel):
    page: int
    page_size: int
    total: int
    total_pages: int

class PaginatedResponse(BaseModel, Generic[T]):
    data: List[T]
    pagination: PaginationMetadata
    message: str = "Success"

class ApiResponse(BaseModel, Generic[T]):
    data: T
    message: str = "Success"

class ErrorDetail(BaseModel):
    code: str
    message: str

class ApiErrorResponse(BaseModel):
    error: ErrorDetail
