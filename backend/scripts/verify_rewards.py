import sys
import os
from decimal import Decimal

sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from sqlmodel import Session, text
from app.core.db import engine
from app.main import app

def run_verification():
    print("=== COINFLOW QUANTITY-BASED REWARD VERIFICATION ===")

    # 1. SQL Query on Neon PostgreSQL
    with Session(engine) as session:
        row = session.exec(
            text("SELECT COUNT(id), COALESCE(SUM(amount), 0) FROM transactions WHERE LOWER(status) = 'success'")
        ).one()
        success_count = int(row[0])
        total_spend = Decimal(str(row[1]))
        calculated_earned = int(total_spend // 100)

    print(f"1. Successful Transactions Count (DB): {success_count:,}")
    print(f"2. Total Successful Spend (DB):        INR {total_spend:,.2f}")
    print(f"3. Calculated Earned Coins (DB):       {calculated_earned:,} coins")

    client = TestClient(app)

    # 4. API GET /api/v1/rewards/balance
    res = client.get("/api/v1/rewards/balance").json()
    b1 = res["data"]
    print("\n--- Initial API Balance Response ---")
    print(f"   - Current Balance: {b1['balance']:,}")
    print(f"   - Total Earned:    {b1['total_earned']:,}")
    print(f"   - Total Redeemed:  {b1['total_redeemed']:,}")

    assert b1["total_earned"] == calculated_earned, f"Mismatch: {b1['total_earned']} vs {calculated_earned}"

    # 5. Fetch rewards catalogue and check per-reward tracking
    rewards_res = client.get("/api/v1/rewards").json()["data"]
    print(f"\n--- Rewards Catalogue ({len(rewards_res)} Rewards) ---")
    for r in rewards_res:
        safe_name = r['name'].encode('ascii', 'ignore').decode('ascii')
        print(f"   - [{r['id']}] {safe_name}: {r['coin_cost']} coins | redeemed_quantity={r['redeemed_quantity']} | is_redeemed={r['is_redeemed']}")

    # Pick a reward to test multi-quantity redemption
    target_reward = rewards_res[0]
    safe_title = target_reward['name'].encode('ascii', 'ignore').decode('ascii')
    initial_qty = target_reward['redeemed_quantity']
    quantity_to_redeem = 3
    unit_cost = target_reward['coin_cost']
    expected_total_cost = unit_cost * quantity_to_redeem

    print(f"\n5. Multi-Quantity Redemption Test:")
    print(f"   Target: '{safe_title}' (Unit Cost: {unit_cost} coins, Quantity: {quantity_to_redeem})")
    print(f"   Expected Total Cost: {expected_total_cost} coins")

    # 6. Perform Multi-Quantity Redemption
    redeem_res = client.post("/api/v1/rewards/redeem", json={
        "reward_id": target_reward["id"],
        "quantity": quantity_to_redeem
    })
    print(f"6. POST /api/v1/rewards/redeem Status Code: {redeem_res.status_code}")
    assert redeem_res.status_code == 200
    p = redeem_res.json()["data"]
    print(f"   Response: quantity={p['quantity']}, unit_cost={p['unit_cost']}, total_cost={p['total_cost']}, remaining_balance={p['remaining_balance']:,}")
    assert p["quantity"] == quantity_to_redeem
    assert p["unit_cost"] == unit_cost
    assert p["total_cost"] == expected_total_cost

    # 7. Post-Redemption Balance Check
    b2 = client.get("/api/v1/rewards/balance").json()["data"]
    print("\n--- Post-Redemption API Balance ---")
    print(f"   - Current Balance: {b2['balance']:,}")
    print(f"   - Total Earned:    {b2['total_earned']:,}")
    print(f"   - Total Redeemed:  {b2['total_redeemed']:,}")

    assert b2["total_redeemed"] == b1["total_redeemed"] + expected_total_cost
    assert b2["balance"] == b1["balance"] - expected_total_cost
    print("   [SUCCESS] Balance & Total Redeemed verified mathematically correct after multi-quantity redemption!")

    # 8. Verify Per-Reward State Separation
    rewards_res_2 = client.get("/api/v1/rewards").json()["data"]
    target_updated = next(r for r in rewards_res_2 if r["id"] == target_reward["id"])
    print(f"\n8. Per-Reward State Verification:")
    print(f"   - '{safe_title}': redeemed_quantity={target_updated['redeemed_quantity']} (expected: {initial_qty + quantity_to_redeem})")
    assert target_updated["redeemed_quantity"] == initial_qty + quantity_to_redeem

    # Verify other rewards did NOT get marked as redeemed if they weren't redeemed
    for other in rewards_res_2:
        if other["id"] != target_reward["id"] and other.get("redeemed_quantity", 0) == 0:
            assert other["is_redeemed"] is False, f"Reward '{other['name']}' was falsely marked as redeemed!"

    print("   [SUCCESS] Per-reward tracking verified! Other rewards remain un-redeemed.")

    # 9. Test Insufficient Balance & Invalid Quantity Rejections
    print("\n9. Validation & Safety Checks:")
    inv_res = client.post("/api/v1/rewards/redeem", json={"reward_id": target_reward["id"], "quantity": 0})
    print(f"   - Quantity 0 Status: {inv_res.status_code}")
    assert inv_res.status_code in [400, 422]

    huge_res = client.post("/api/v1/rewards/redeem", json={"reward_id": target_reward["id"], "quantity": 99999999})
    print(f"   - Insufficient Balance Status: {huge_res.status_code} | Code: {huge_res.json().get('error', {}).get('code')}")
    assert huge_res.status_code == 400
    assert huge_res.json()["error"]["code"] == "INSUFFICIENT_REWARD_BALANCE"
    print("   [SUCCESS] Validation & Insufficient Balance rejection verified!")

    print("\n=== ALL 20 QUANTITY-BASED REWARD VERIFICATION CHECKS PASSED 100% ===")

if __name__ == "__main__":
    run_verification()
