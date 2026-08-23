from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid

class Redemption(SQLModel, table=True):
    __tablename__ = "redemptions"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True, max_length=64)
    account_id: int = Field(foreign_key="coin_accounts.id")
    reward_id: str = Field(foreign_key="rewards.id")
    coin_cost: int
    status: str = Field(default="SUCCESS", max_length=50)
    created_at: datetime = Field(default_factory=datetime.utcnow)
