from sqlmodel import Session, select, text
from typing import List, Optional, Set
from datetime import datetime
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

    def get_coin_balance_stats(self, user_id: str = "default_user") -> CoinAccount:
        """Dynamically calculates earned coins from successful transactions and redeemed coins from redemptions."""
        # 1. Total successful spend from PostgreSQL transactions table
        spend_sql = text("SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE LOWER(status) = 'success'")
        total_successful_spend = float(self.session.exec(spend_sql).one()[0] or 0)
        earned_coins = int(total_successful_spend // 100)

        # 2. Total redeemed coins from redemptions table
        account = self.get_coin_account(user_id)
        redemption_sql = text(
            "SELECT COALESCE(SUM(r.coin_cost), 0) "
            "FROM redemptions r "
            "WHERE r.account_id = :account_id AND LOWER(r.status) = 'success'"
        )
        total_redeemed = int(self.session.exec(redemption_sql, params={"account_id": account.id}).one()[0] or 0)

        current_balance = max(0, earned_coins - total_redeemed)

        # 3. Update account record with current dynamic balance stats
        account.total_earned = earned_coins
        account.total_redeemed = total_redeemed
        account.balance = current_balance
        account.updated_at = datetime.utcnow()
        self.session.add(account)
        self.session.commit()
        self.session.refresh(account)
        return account

    def get_user_redeemed_reward_ids(self, user_id: str = "default_user") -> Set[str]:
        account = self.get_coin_account(user_id)
        redemptions = self.session.exec(
            select(Redemption.reward_id).where(
                Redemption.account_id == account.id,
                Redemption.status == "SUCCESS"
            )
        ).all()
        return set(redemptions)

    def is_reward_already_redeemed(self, account_id: int, reward_id: str) -> bool:
        query = select(Redemption).where(
            Redemption.account_id == account_id,
            Redemption.reward_id == reward_id,
            Redemption.status == "SUCCESS"
        )
        return self.session.exec(query).first() is not None

    def create_redemption(
        self, account: CoinAccount, reward: Reward
    ) -> Redemption:
        # Atomic redemption record creation
        redemption = Redemption(
            account_id=account.id,
            reward_id=reward.id,
            coin_cost=reward.coin_cost,
            status="SUCCESS"
        )
        self.session.add(redemption)
        self.session.commit()

        # Recalculate and update stats
        self.get_coin_balance_stats(account.user_id)
        self.session.refresh(redemption)
        return redemption
