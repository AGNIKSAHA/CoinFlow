from sqlmodel import Session, select, text
from typing import List, Optional, Dict
from datetime import datetime
from app.models.reward import Reward
from app.models.coin_account import CoinAccount
from app.models.redemption import Redemption

class RewardRepository:
    def __init__(self, session: Session):
        self.session = session

    def get_all_active_rewards(self) -> List[Reward]:
        query = select(Reward).where(Reward.is_active == True).order_by(Reward.coin_cost.asc())
        return list(self.session.exec(query).all())

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

        # 2. Total redeemed coins from redemptions table (sum of total_cost)
        account = self.get_coin_account(user_id)
        redemption_sql = text(
            "SELECT COALESCE(SUM(COALESCE(r.total_cost, r.coin_cost * r.quantity)), 0) "
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

    def get_user_redeemed_quantities(self, user_id: str = "default_user") -> Dict[str, int]:
        account = self.get_coin_account(user_id)
        sql = text(
            "SELECT r.reward_id, COALESCE(SUM(r.quantity), 0) "
            "FROM redemptions r "
            "WHERE r.account_id = :account_id AND LOWER(r.status) = 'success' "
            "GROUP BY r.reward_id"
        )
        rows = self.session.exec(sql, params={"account_id": account.id}).all()
        return {str(row[0]): int(row[1]) for row in rows}

    def create_redemption(
        self, account: CoinAccount, reward: Reward, quantity: int
    ) -> Redemption:
        total_cost = reward.coin_cost * quantity
        redemption = Redemption(
            account_id=account.id,
            reward_id=reward.id,
            quantity=quantity,
            coin_cost=reward.coin_cost,
            total_cost=total_cost,
            status="SUCCESS"
        )
        self.session.add(redemption)
        self.session.commit()

        # Recalculate stats in database
        self.get_coin_balance_stats(account.user_id)
        self.session.refresh(redemption)
        return redemption
