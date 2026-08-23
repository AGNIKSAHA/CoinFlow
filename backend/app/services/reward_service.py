from sqlmodel import Session
from app.repositories.reward_repository import RewardRepository
from app.schemas.reward import (
    RewardRead,
    CoinBalanceRead,
    RedeemRewardRequest,
    RedeemRewardResponse
)
from app.schemas.common import ApiResponse
from fastapi import HTTPException, status
from typing import List
from datetime import datetime

class RewardService:
    def __init__(self, session: Session):
        self.session = session
        self.repo = RewardRepository(session)

    def get_rewards(self) -> ApiResponse[List[RewardRead]]:
        rewards = self.repo.get_all_active_rewards()
        return ApiResponse(data=[RewardRead.model_validate(r) for r in rewards])

    def get_balance(self, user_id: str = "default_user") -> ApiResponse[CoinBalanceRead]:
        account = self.repo.get_coin_account(user_id)
        return ApiResponse(data=CoinBalanceRead.model_validate(account))

    def redeem_reward(
        self, req: RedeemRewardRequest, user_id: str = "default_user"
    ) -> ApiResponse[RedeemRewardResponse]:
        # 1. Fetch reward
        reward = self.repo.get_reward_by_id(req.reward_id)
        if not reward:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"code": "REWARD_NOT_FOUND", "message": f"Reward with ID '{req.reward_id}' does not exist."}
            )

        if not reward.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"code": "REWARD_INACTIVE", "message": "This reward is no longer available for redemption."}
            )

        # 2. Fetch coin account
        account = self.repo.get_coin_account(user_id)

        # 3. Check sufficient balance
        if account.balance < reward.coin_cost:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "code": "INSUFFICIENT_BALANCE",
                    "message": f"Insufficient balance. You need {reward.coin_cost} coins, but only have {account.balance} coins."
                }
            )

        # 4. Perform atomic redemption transaction
        try:
            redemption = self.repo.create_redemption(account, reward)
            return ApiResponse(
                data=RedeemRewardResponse(
                    redemption_id=redemption.id,
                    reward_id=reward.id,
                    reward_name=reward.name,
                    coins_deducted=reward.coin_cost,
                    remaining_balance=account.balance,
                    redeemed_at=redemption.created_at
                ),
                message=f"Successfully redeemed '{reward.name}'!"
            )
        except Exception as e:
            self.session.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={"code": "REDEMPTION_FAILED", "message": "Failed to process redemption transaction. Transaction rolled back."}
            )
