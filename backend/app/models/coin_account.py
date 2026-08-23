from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class CoinAccount(SQLModel, table=True):
    __tablename__ = "coin_accounts"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(default="default_user", unique=True, index=True, max_length=100)
    balance: int = Field(default=0)
    total_earned: int = Field(default=0)
    total_redeemed: int = Field(default=0)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
