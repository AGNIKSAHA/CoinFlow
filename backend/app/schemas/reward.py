from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

class RewardRead(BaseModel):
    id: str
    name: str
    description: str
    coin_cost: int
    category: str
    image_url: str
    is_active: bool
    redeemed_quantity: int = 0
    is_redeemed: bool = False
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CoinBalanceRead(BaseModel):
    balance: int
    total_earned: int
    total_redeemed: int
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class RedeemRewardRequest(BaseModel):
    reward_id: str = Field(min_length=1)
    quantity: int = Field(default=1, ge=1)

class RedeemRewardResponse(BaseModel):
    redemption_id: str
    reward_id: str
    reward_name: str
    quantity: int
    unit_cost: int
    total_cost: int
    remaining_balance: int
    redeemed_at: datetime
