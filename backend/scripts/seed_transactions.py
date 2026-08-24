import json
import os
import sys
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional, List, Dict, Any, Set

# Add backend directory to sys.path so app modules import correctly
sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__), "..")))

from sqlmodel import Session, select
from app.core.db import engine
from app.models.transaction import Transaction
from app.models.reward import Reward
from app.models.coin_account import CoinAccount

def normalize_timestamp(ts: Any) -> datetime:
    """Normalize raw timestamp into UTC datetime."""
    if ts is None:
        return datetime.now(timezone.utc)
    if isinstance(ts, (int, float)):
        sec = ts / 1000.0 if ts > 1e11 else float(ts)
        return datetime.fromtimestamp(sec, tz=timezone.utc)
    ts_str = str(ts).strip()
    if ts_str.isdigit():
        val = float(ts_str)
        sec = val / 1000.0 if val > 1e11 else val
        return datetime.fromtimestamp(sec, tz=timezone.utc)
    
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

    return datetime.now(timezone.utc)

def normalize_category(cat: Any) -> Optional[str]:
    """Preserve null categories while stripping clean strings."""
    if cat is None:
        return None
    cat_str = str(cat).strip()
    if cat_str.lower() in ["null", "none", "", "nan"]:
        return None
    return cat_str

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

def seed_transactions():
    """Main production seeding routine for transactions and rewards catalog."""
    # Find dataset
    possible_paths = [
        os.path.join(os.path.dirname(__file__), "..", "data", "transactions.json"),
        os.path.join(os.path.dirname(__file__), "..", "..", "transactions (2).json"),
        os.path.join(os.path.dirname(__file__), "..", "..", "transactions.json"),
    ]

    json_path = None
    for p in possible_paths:
        if os.path.exists(p):
            json_path = p
            break

    if not json_path:
        print("Error: Could not locate transaction JSON file in backend/data/transactions.json!")
        sys.exit(1)

    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    total_loaded = len(data)

    valid_records: List[Transaction] = []
    failed_count = 0
    id_tracker: Dict[str, int] = {}
    total_earned_coins = 0

    for idx, item in enumerate(data):
        try:
            raw_id = item.get("id") or f"TXN_{idx:06d}"
            
            # Suffix duplicate IDs in dataset to ensure all records remain unique
            if raw_id in id_tracker:
                id_tracker[raw_id] += 1
                tid = f"{raw_id}_dup{id_tracker[raw_id]}"
            else:
                id_tracker[raw_id] = 1
                tid = raw_id

            ts = normalize_timestamp(item.get("timestamp"))
            merchant = str(item.get("merchant") or "Unknown Merchant").strip()
            category = normalize_category(item.get("category"))

            # Amount parsing
            raw_amount = item.get("amount", 0.0)
            amount = Decimal(str(raw_amount)) if raw_amount is not None else Decimal("0.00")

            currency = str(item.get("currency") or "INR").strip().upper()
            status_str = str(item.get("status") or "SUCCESS").strip().upper()
            payment_method = str(item.get("payment_method") or "Credit Card").strip()

            if status_str == "SUCCESS" and amount > 0:
                earned = int(amount // 100)
                total_earned_coins += min(earned, 500)

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
            valid_records.append(txn)
        except Exception as err:
            failed_count += 1

    valid_count = len(valid_records)

    with Session(engine) as session:
        # Check existing transaction IDs in DB
        existing_ids: Set[str] = set(session.exec(select(Transaction.id)).all())
        already_existing_count = 0
        to_insert: List[Transaction] = []

        for txn in valid_records:
            if txn.id in existing_ids:
                already_existing_count += 1
            else:
                to_insert.append(txn)

        inserted_count = len(to_insert)
        skipped_count = already_existing_count

        # Batch insert missing records
        if to_insert:
            batch_size = 1000
            for i in range(0, len(to_insert), batch_size):
                batch = to_insert[i:i + batch_size]
                session.add_all(batch)
                session.commit()

        # Seed Rewards catalogue if missing
        existing_rewards = session.exec(select(Reward)).all()
        if not existing_rewards:
            for r_data in REWARDS_CATALOGUE:
                session.add(Reward(**r_data))
            session.commit()

        # Seed or sync default Coin Account
        existing_account = session.exec(select(CoinAccount).where(CoinAccount.user_id == "default_user")).first()
        if not existing_account:
            account = CoinAccount(
                user_id="default_user",
                balance=total_earned_coins,
                total_earned=total_earned_coins,
                total_redeemed=0
            )
            session.add(account)
            session.commit()

    # Output exact summary as requested
    print(f"Loaded {total_loaded} records.")
    print(f"Valid records: {valid_count}")
    print(f"Already existing: {already_existing_count}")
    print(f"Inserted: {inserted_count}")
    print(f"Skipped: {skipped_count}")
    print(f"Failed: {failed_count}")

if __name__ == "__main__":
    seed_transactions()
