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

class RewardService:
    def __init__(self, session: Session):
        self.session = session
        self.repo = RewardRepository(session)

    def get_rewards(self, user_id: str = "default_user") -> ApiResponse[List[RewardRead]]:
        rewards = self.repo.get_all_active_rewards()
        redeemed_ids = self.repo.get_user_redeemed_reward_ids(user_id)
        
        result: List[RewardRead] = []
        for r in rewards:
            r_data = RewardRead.model_validate(r)
            r_data.is_redeemed = r.id in redeemed_ids
            result.append(r_data)

        return ApiResponse(data=result)

    def get_balance(self, user_id: str = "default_user") -> ApiResponse[CoinBalanceRead]:
        account = self.repo.get_coin_balance_stats(user_id)
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

        # 2. Fetch current dynamic coin account stats
        account = self.repo.get_coin_balance_stats(user_id)

        # 3. Check if already redeemed (duplicate prevention)
        if self.repo.is_reward_already_redeemed(account.id, reward.id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "code": "REWARD_ALREADY_REDEEMED",
                    "message": f"You have already redeemed '{reward.name}'."
                }
            )

        # 4. Check sufficient balance
        if account.balance < reward.coin_cost:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "code": "INSUFFICIENT_BALANCE",
                    "message": f"Insufficient balance. You need {reward.coin_cost} coins, but currently have {account.balance} coins."
                }
            )

        # 5. Perform atomic redemption transaction
        try:
            redemption = self.repo.create_redemption(account, reward)
            # Re-fetch updated balance
            updated_account = self.repo.get_coin_balance_stats(user_id)
            return ApiResponse(
                data=RedeemRewardResponse(
                    redemption_id=redemption.id,
                    reward_id=reward.id,
                    reward_name=reward.name,
                    coins_deducted=reward.coin_cost,
                    remaining_balance=updated_account.balance,
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
