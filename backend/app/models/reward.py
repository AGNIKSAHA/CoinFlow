from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class Reward(SQLModel, table=True):
    __tablename__ = "rewards"

    id: str = Field(primary_key=True, max_length=64)
    name: str = Field(max_length=255)
    description: str
    coin_cost: int = Field(gt=0)
    category: str = Field(max_length=100)
    image_url: str
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
