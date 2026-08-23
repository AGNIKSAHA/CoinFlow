from sqlmodel import Session, select
from typing import List, Optional
from app.models.reward import Reward
from app.models.coin_account import CoinAccount
from app.models.redemption import Redemption

class RewardRepository:
    def __init__(self, session: Session):
        self.session = session

    def get_all_active_rewards(self) -> List[Reward]:
        query = select(Reward).where(Reward.is_active == True).order_by(Reward.coin_cost.asc())
        return self.session.exec(query).all()

    def get_reward_by_id(self, reward_id: str) -> Optional[Reward]:
        return self.session.get(Reward, reward_id)

    def get_coin_account(self, user_id: str = "default_user") -> CoinAccount:
        query = select(CoinAccount).where(CoinAccount.user_id == user_id)
        account = self.session.exec(query).first()
        if not account:
            account = CoinAccount(user_id=user_id, balance=0, total_earned=0, total_redeemed=0)
            self.session.add(account)
            self.session.commit()
            self.session.refresh(account)
        return account

    def create_redemption(
        self, account: CoinAccount, reward: Reward
    ) -> Redemption:
        # Atomic updates within current session
        account.balance -= reward.coin_cost
        account.total_redeemed += reward.coin_cost
        self.session.add(account)

        redemption = Redemption(
            account_id=account.id,
            reward_id=reward.id,
            coin_cost=reward.coin_cost,
            status="SUCCESS"
        )
        self.session.add(redemption)
        self.session.commit()
        self.session.refresh(account)
        self.session.refresh(redemption)
        return redemption
