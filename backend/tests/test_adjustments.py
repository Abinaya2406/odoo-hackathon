from app.extensions import db
from app.models.stock import Stock
from app.models.stock_ledger import StockLedger

def test_stock_adjustment_calculation_and_ledger(client, auth_headers, seed_data):
    p_id = seed_data["product_1_id"]
    wh_id = seed_data["warehouse_1_id"]
    loc_id = seed_data["location_1_id"]

    # Initial system stock = 45.0
    stock = Stock(product_id=p_id, warehouse_id=wh_id, location_id=loc_id, quantity=45.0)
    db.session.add(stock)
    db.session.commit()

    # User performs physical audit count = 50.0 (difference = +5.0)
    res = client.post(
        "/api/adjustments",
        headers=auth_headers,
        json={
            "product_id": p_id,
            "warehouse_id": wh_id,
            "location_id": loc_id,
            "physical_quantity": 50.0,
            "reason": "Quarterly physical count discrepancy correction",
        },
    )
    assert res.status_code == 201
    adj = res.get_json()["data"]

    assert adj["system_quantity"] == 45.0
    assert adj["physical_quantity"] == 50.0
    assert adj["difference"] == 5.0
    assert adj["reason"] == "Quarterly physical count discrepancy correction"

    # Verify stock table updated to physical count (50.0)
    stock_after = Stock.query.filter_by(product_id=p_id, location_id=loc_id).first()
    assert stock_after.quantity == 50.0

    # Verify StockLedger recorded the adjustment
    ledger = StockLedger.query.filter_by(product_id=p_id, transaction_type="ADJUSTMENT").first()
    assert ledger is not None
    assert ledger.quantity == 5.0
    assert ledger.previous_quantity == 45.0
    assert ledger.new_quantity == 50.0

def test_negative_adjustment_downwards(client, auth_headers, seed_data):
    p_id = seed_data["product_1_id"]
    wh_id = seed_data["warehouse_1_id"]
    loc_id = seed_data["location_1_id"]

    # Current stock = 100.0, Physical count = 92.0 (difference = -8.0 damaged items)
    stock = Stock(product_id=p_id, warehouse_id=wh_id, location_id=loc_id, quantity=100.0)
    db.session.add(stock)
    db.session.commit()

    res = client.post(
        "/api/adjustments",
        headers=auth_headers,
        json={
            "product_id": p_id,
            "warehouse_id": wh_id,
            "location_id": loc_id,
            "physical_quantity": 92.0,
            "reason": "Water damage write-off",
        },
    )
    assert res.status_code == 201
    adj = res.get_json()["data"]
    assert adj["difference"] == -8.0

    stock_after = Stock.query.filter_by(product_id=p_id, location_id=loc_id).first()
    assert stock_after.quantity == 92.0
