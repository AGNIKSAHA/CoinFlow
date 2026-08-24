import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"

def test_get_transactions_pagination():
    response = client.get("/api/v1/transactions?page=1&page_size=10")
    assert response.status_code == 200
    payload = response.json()
    assert "data" in payload
    assert "pagination" in payload
    assert len(payload["data"]) == 10
    assert payload["pagination"]["total"] == 10000
    assert payload["pagination"]["total_pages"] == 1000

def test_get_transactions_search_and_filter():
    response = client.get("/api/v1/transactions?search=Cult.fit&payment_status=SUCCESS")
    assert response.status_code == 200
    payload = response.json()
    assert len(payload["data"]) > 0
    for txn in payload["data"]:
        assert "cult.fit" in txn["merchant"].lower()
        assert txn["status"] == "SUCCESS"

def test_get_analytics():
    cat_resp = client.get("/api/v1/analytics/category")
    assert cat_resp.status_code == 200
    cat_payload = cat_resp.json()
    assert len(cat_payload["data"]["items"]) > 0

    monthly_resp = client.get("/api/v1/analytics/monthly")
    assert monthly_resp.status_code == 200
    monthly_payload = monthly_resp.json()
    assert len(monthly_payload["data"]["items"]) > 0

def test_get_rewards_and_balance():
    rewards_resp = client.get("/api/v1/rewards")
    assert rewards_resp.status_code == 200
    assert len(rewards_resp.json()["data"]) == 5

    bal_resp = client.get("/api/v1/rewards/balance")
    assert bal_resp.status_code == 200
    assert bal_resp.json()["data"]["balance"] > 0

def test_redeem_single_and_multi_quantity_reward_flow():
    # 1. Fetch initial balance
    bal_before = client.get("/api/v1/rewards/balance").json()["data"]["balance"]

    # 2. Redeem 1 unit of BookMyShow
    resp1 = client.post("/api/v1/rewards/redeem", json={"reward_id": "reward_bookmyshow_200", "quantity": 1})
    assert resp1.status_code == 200
    p1 = resp1.json()["data"]
    assert p1["quantity"] == 1
    assert p1["unit_cost"] == 100
    assert p1["total_cost"] == 100
    assert p1["remaining_balance"] == bal_before - 100

    # 3. Redeem 3 units of BookMyShow (multiple quantities of same reward)
    resp2 = client.post("/api/v1/rewards/redeem", json={"reward_id": "reward_bookmyshow_200", "quantity": 3})
    assert resp2.status_code == 200
    p2 = resp2.json()["data"]
    assert p2["quantity"] == 3
    assert p2["unit_cost"] == 100
    assert p2["total_cost"] == 300
    assert p2["remaining_balance"] == bal_before - 400

    # 4. Verify per-reward redeemed_quantity state (BookMyShow should have redeemed_quantity >= 4)
    rewards_list = client.get("/api/v1/rewards").json()["data"]
    bms_reward = next(r for r in rewards_list if r["id"] == "reward_bookmyshow_200")
    assert bms_reward["redeemed_quantity"] >= 4
    assert bms_reward["is_redeemed"] is True

    # Confirm other rewards that haven't been redeemed do NOT get marked as redeemed
    other_rewards = [r for r in rewards_list if r["id"] != "reward_bookmyshow_200" and r.get("redeemed_quantity", 0) == 0]
    for other in other_rewards:
        assert other["is_redeemed"] is False

def test_redeem_invalid_quantity():
    # Quantity 0 rejection
    resp_zero = client.post("/api/v1/rewards/redeem", json={"reward_id": "reward_amazon_500", "quantity": 0})
    assert resp_zero.status_code in [400, 422]

    # Negative quantity rejection
    resp_neg = client.post("/api/v1/rewards/redeem", json={"reward_id": "reward_amazon_500", "quantity": -5})
    assert resp_neg.status_code in [400, 422]

def test_redeem_nonexistent_reward():
    resp = client.post("/api/v1/rewards/redeem", json={"reward_id": "nonexistent_reward_999", "quantity": 1})
    assert resp.status_code == 404
    payload = resp.json()
    assert payload["error"]["code"] == "REWARD_NOT_FOUND"

def test_redeem_insufficient_balance_error():
    # Quantity far exceeding balance
    resp = client.post("/api/v1/rewards/redeem", json={"reward_id": "reward_make_my_trip_1000", "quantity": 99999999})
    assert resp.status_code == 400
    payload = resp.json()
    assert payload["error"]["code"] == "INSUFFICIENT_REWARD_BALANCE"
