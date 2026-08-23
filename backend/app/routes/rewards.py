from fastapi import APIRouter, Depends
from sqlmodel import Session
from typing import List
from app.core.db import get_db
from app.schemas.reward import (
    RewardRead,
    CoinBalanceRead,
    RedeemRewardRequest,
    RedeemRewardResponse
)
from app.schemas.common import ApiResponse
from app.services.reward_service import RewardService

router = APIRouter(prefix="/rewards", tags=["Rewards"])

@router.get("", response_model=ApiResponse[List[RewardRead]])
def get_rewards(db: Session = Depends(get_db)):
    service = RewardService(db)
    return service.get_rewards()

@router.get("/balance", response_model=ApiResponse[CoinBalanceRead])
def get_balance(db: Session = Depends(get_db)):
    service = RewardService(db)
    return service.get_balance()

@router.post("/redeem", response_model=ApiResponse[RedeemRewardResponse])
def redeem_reward(req: RedeemRewardRequest, db: Session = Depends(get_db)):
    service = RewardService(db)
    return service.redeem_reward(req)
