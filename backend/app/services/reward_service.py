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
        redeemed_quantities = self.repo.get_user_redeemed_quantities(user_id)
        
        result: List[RewardRead] = []
        for r in rewards:
            r_data = RewardRead.model_validate(r)
            qty = redeemed_quantities.get(r.id, 0)
            r_data.redeemed_quantity = qty
            r_data.is_redeemed = qty > 0
            result.append(r_data)

        return ApiResponse(data=result)

    def get_balance(self, user_id: str = "default_user") -> ApiResponse[CoinBalanceRead]:
        account = self.repo.get_coin_balance_stats(user_id)
        return ApiResponse(data=CoinBalanceRead.model_validate(account))

    def redeem_reward(
        self, req: RedeemRewardRequest, user_id: str = "default_user"
    ) -> ApiResponse[RedeemRewardResponse]:
        # 1. Validate quantity
        if req.quantity < 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"code": "INVALID_QUANTITY", "message": "Redemption quantity must be at least 1."}
            )

        # 2. Fetch reward
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

        # 3. Fetch current dynamic coin account stats
        account = self.repo.get_coin_balance_stats(user_id)

        # 4. Calculate authoritative backend total cost
        total_cost = reward.coin_cost * req.quantity

        # 5. Check sufficient balance
        if account.balance < total_cost:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "code": "INSUFFICIENT_REWARD_BALANCE",
                    "message": "Insufficient reward coins for this redemption."
                }
            )

        # 6. Perform atomic redemption transaction
        try:
            redemption = self.repo.create_redemption(account, reward, req.quantity)
            updated_account = self.repo.get_coin_balance_stats(user_id)
            return ApiResponse(
                data=RedeemRewardResponse(
                    redemption_id=redemption.id,
                    reward_id=reward.id,
                    reward_name=reward.name,
                    quantity=req.quantity,
                    unit_cost=reward.coin_cost,
                    total_cost=total_cost,
                    remaining_balance=updated_account.balance,
                    redeemed_at=redemption.created_at
                ),
                message=f"Successfully redeemed {req.quantity}x '{reward.name}'!"
            )
        except Exception as e:
            self.session.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={"code": "REDEMPTION_FAILED", "message": "Failed to process redemption transaction. Transaction rolled back."}
            )
