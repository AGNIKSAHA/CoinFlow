from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid

class Redemption(SQLModel, table=True):
    __tablename__ = "redemptions"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True, max_length=64)
    account_id: int = Field(foreign_key="coin_accounts.id")
    reward_id: str = Field(foreign_key="rewards.id")
    quantity: int = Field(default=1)
    coin_cost: int = Field(description="Unit cost of reward in coins")
    total_cost: int = Field(default=0, description="Total cost = coin_cost * quantity")
    status: str = Field(default="SUCCESS", max_length=50)
    created_at: datetime = Field(default_factory=datetime.utcnow)
