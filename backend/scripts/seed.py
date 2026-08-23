import json
import os
import sys
from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Dict, Any

# Add parent directory to sys.path
sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__), "..")))

from sqlmodel import Session, select, text
from app.core.db import engine
from app.models.transaction import Transaction
from app.models.reward import Reward
from app.models.coin_account import CoinAccount

def normalize_timestamp(ts: Any) -> Optional[datetime]:
    if ts is None:
        return None
    if isinstance(ts, (int, float)):
        sec = ts / 1000.0 if ts > 1e11 else float(ts)
        return datetime.fromtimestamp(sec)
    ts_str = str(ts).strip()
    if ts_str.isdigit():
        val = float(ts_str)
        sec = val / 1000.0 if val > 1e11 else val
        return datetime.fromtimestamp(sec)
    
    # Try ISO format
    try:
        iso_str = ts_str.replace('Z', '+00:00')
        return datetime.fromisoformat(iso_str)
    except Exception:
        pass
        
    for fmt in [
        '%Y-%m-%d',
        '%d/%m/%Y %H:%M:%S',
        '%m/%d/%Y %H:%M:%S',
        '%d/%m/%Y',
        '%m/%d/%Y'
    ]:
        try:
            return datetime.strptime(ts_str, fmt)
        except ValueError:
            pass
    return None

REWARDS_CATALOGUE = [
    {
        "id": "reward_amazon_500",
        "name": "₹500 Amazon Shopping Voucher",
        "description": "Redeem your coins for a ₹500 digital gift card valid across Amazon India catalog.",
        "coin_cost": 250,
        "category": "Shopping",
        "image_url": "/images/rewards/amazon.svg",
        "is_active": True
    },
    {
        "id": "reward_cashback_250",
        "name": "₹250 Direct Credit Card Cashback",
        "description": "Get ₹250 direct cash statement credit applied directly to your primary credit card balance.",
        "coin_cost": 150,
        "category": "Cashback",
        "image_url": "/images/rewards/cashback.svg",
        "is_active": True
    },
    {
        "id": "reward_swiggy_300",
        "name": "₹300 Swiggy Gourmet Voucher",
        "description": "Enjoy gourmet food delivery or dining out discounts with a ₹300 Swiggy voucher.",
        "coin_cost": 180,
        "category": "Food & Dining",
        "image_url": "/images/rewards/swiggy.svg",
        "is_active": True
    },
    {
        "id": "reward_make_my_trip_1000",
        "name": "₹1,000 MakeMyTrip Flight Voucher",
        "description": "Save ₹1,000 on domestic flight bookings and hotel stays across India.",
        "coin_cost": 500,
        "category": "Travel",
        "image_url": "/images/rewards/travel.svg",
        "is_active": True
    },
    {
        "id": "reward_bookmyshow_200",
        "name": "₹200 BookMyShow Movie Ticket Voucher",
        "description": "Catch the latest blockbusters with ₹200 off cinema tickets on BookMyShow.",
        "coin_cost": 100,
        "category": "Entertainment",
        "image_url": "/images/rewards/entertainment.svg",
        "is_active": True
    }
]

def seed_database():
    # Locate JSON file
    possible_paths = [
        os.path.join(os.path.dirname(__file__), "..", "..", "transactions (2).json"),
        os.path.join(os.path.dirname(__file__), "..", "..", "transactions.json"),
        "a:/CoinFlow/transactions (2).json",
        "a:/CoinFlow/transactions.json"
    ]
    
    json_path = None
    for p in possible_paths:
        if os.path.exists(p):
            json_path = p
            break

    if not json_path:
        print("Error: Could not locate transaction JSON file!")
        sys.exit(1)

    print(f"Loading transaction dataset from: {os.path.abspath(json_path)}")
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    print(f"Loaded {len(data)} raw transaction items.")

    id_seen: Dict[str, int] = {}
    transactions_to_insert: List[Transaction] = []
    total_earned_coins = 0
    duplicate_count = 0

    for idx, item in enumerate(data):
        raw_id = item.get("id") or f"TXN_GEN_{idx:06d}"
        
        # Handle duplicates safely by suffixing
        if raw_id in id_seen:
            duplicate_count += 1
            id_seen[raw_id] += 1
            tid = f"{raw_id}_dup{id_seen[raw_id]}"
        else:
            id_seen[raw_id] = 1
            tid = raw_id

        # Normalize timestamp
        ts = normalize_timestamp(item.get("timestamp")) or datetime.utcnow()
        
        # Merchant
        merchant = str(item.get("merchant") or "Unknown Merchant").strip()
        
        # Category (nullable)
        raw_cat = item.get("category")
        category = str(raw_cat).strip() if raw_cat and str(raw_cat).strip() not in ["null", "None", ""] else None

        # Amount parsing
        amt_val = item.get("amount", 0.0)
        try:
            amount = Decimal(str(amt_val))
        except Exception:
            amount = Decimal("0.00")

        # Currency & Status
        currency = str(item.get("currency") or "INR").strip().upper()
        status_str = str(item.get("status") or "SUCCESS").strip().upper()
        payment_method = str(item.get("payment_method") or "Credit Card").strip()

        # Coin calculation rule: 1 coin per ₹100 spent on SUCCESS transactions, capped at 500 coins per transaction
        if status_str == "SUCCESS" and amount > 0:
            earned = int(amount // 100)
            earned_capped = min(earned, 500)
            total_earned_coins += earned_capped

        txn = Transaction(
            id=tid,
            timestamp=ts,
            merchant=merchant,
            category=category,
            amount=amount,
            currency=currency,
            status=status_str,
            payment_method=payment_method
        )
        transactions_to_insert.append(txn)

    print(f"Data Normalization Complete:")
    print(f"  - Total Transactions to Seed: {len(transactions_to_insert)}")
    print(f"  - Duplicate IDs Renamed: {duplicate_count}")
    print(f"  - Calculated Total Initial Earned Coins: {total_earned_coins:,}")

    with Session(engine) as session:
        # Clear existing data safely if re-running
        print("Clearing previous database tables...")
        session.exec(text("TRUNCATE TABLE redemptions, coin_accounts, rewards, transactions RESTART IDENTITY CASCADE;"))
        session.commit()

        # Batch insert transactions
        print("Bulk inserting 10,000 transactions into PostgreSQL 18...")
        batch_size = 1000
        for i in range(0, len(transactions_to_insert), batch_size):
            batch = transactions_to_insert[i:i + batch_size]
            session.add_all(batch)
            session.commit()
            print(f"  Inserted {min(i + batch_size, len(transactions_to_insert))} / {len(transactions_to_insert)} records...")

        # Seed Rewards Catalogue
        print("Seeding Rewards Catalogue...")
        for r_data in REWARDS_CATALOGUE:
            reward = Reward(**r_data)
            session.add(reward)
        session.commit()

        # Seed Coin Account
        print("Initializing Coin Account...")
        account = CoinAccount(
            user_id="default_user",
            balance=total_earned_coins,
            total_earned=total_earned_coins,
            total_redeemed=0
        )
        session.add(account)
        session.commit()

    print("DATABASE SEEDING COMPLETED SUCCESSFULLY!")
    print(f"Summary: {len(transactions_to_insert)} transactions, {len(REWARDS_CATALOGUE)} rewards, {total_earned_coins:,} coins balance.")

if __name__ == "__main__":
    seed_database()
