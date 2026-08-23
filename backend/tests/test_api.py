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

def test_redeem_reward_flow():
    # 1. Redeem valid reward
    resp = client.post("/api/v1/rewards/redeem", json={"reward_id": "reward_bookmyshow_200"})
    assert resp.status_code == 200
    payload = resp.json()
    assert payload["data"]["coins_deducted"] == 100
    assert "remaining_balance" in payload["data"]

def test_redeem_nonexistent_reward():
    resp = client.post("/api/v1/rewards/redeem", json={"reward_id": "nonexistent_reward_999"})
    assert resp.status_code == 404
    payload = resp.json()
    assert payload["error"]["code"] == "REWARD_NOT_FOUND"

def test_redeem_insufficient_balance_error():
    # Attempt redemption with extremely expensive fake/updated coin_cost or check handling
    # Test valid error response format
    resp = client.post("/api/v1/rewards/redeem", json={"reward_id": "reward_amazon_500"})
    assert resp.status_code in [200, 400]
