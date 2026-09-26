from app.extensions import db
from app.models.stock import Stock
from app.models.stock_ledger import StockLedger

def test_delivery_validation_fails_on_insufficient_stock(client, auth_headers, seed_data):
    """
    CRITICAL SPECIFICATION TEST:
    If stock = 10, Delivery = 20 -> API must reject the operation with HTTP 400.
    """
    p_id = seed_data["product_1_id"]
    wh_id = seed_data["warehouse_1_id"]
    loc_id = seed_data["location_1_id"]

    # Initial stock = 10
    stock = Stock(product_id=p_id, warehouse_id=wh_id, location_id=loc_id, quantity=10.0)
    db.session.add(stock)
    db.session.commit()

    # Create delivery for 20 units
    create_res = client.post(
        "/api/deliveries",
        headers=auth_headers,
        json={
            "customer_name": "Acme Industries",
            "warehouse_id": wh_id,
            "items": [
                {"product_id": p_id, "quantity": 20.0, "location_id": loc_id}
            ],
        },
    )
    assert create_res.status_code == 201
    delivery_id = create_res.get_json()["data"]["id"]

    # Attempt to validate delivery
    val_res = client.post(f"/api/deliveries/{delivery_id}/validate", headers=auth_headers)
    assert val_res.status_code == 400
    res_data = val_res.get_json()
    assert res_data["success"] is False
    assert "Insufficient stock" in res_data["message"]

    # Verify stock remained untouched at 10.0
    stock_check = Stock.query.filter_by(product_id=p_id, location_id=loc_id).first()
    assert stock_check.quantity == 10.0

def test_delivery_validation_success_decreases_stock(client, auth_headers, seed_data):
    p_id = seed_data["product_1_id"]
    wh_id = seed_data["warehouse_1_id"]
    loc_id = seed_data["location_1_id"]

    # Initial stock = 50
    stock = Stock(product_id=p_id, warehouse_id=wh_id, location_id=loc_id, quantity=50.0)
    db.session.add(stock)
    db.session.commit()

    # Delivery for 20 units
    create_res = client.post(
        "/api/deliveries",
        headers=auth_headers,
        json={
            "customer_name": "Global Tech",
            "warehouse_id": wh_id,
            "items": [
                {"product_id": p_id, "quantity": 20.0, "location_id": loc_id}
            ],
        },
    )
    delivery_id = create_res.get_json()["data"]["id"]

    val_res = client.post(f"/api/deliveries/{delivery_id}/validate", headers=auth_headers)
    assert val_res.status_code == 200

    # Stock should be 50 - 20 = 30
    stock_after = Stock.query.filter_by(product_id=p_id, location_id=loc_id).first()
    assert stock_after.quantity == 30.0

    # Check ledger
    ledger = StockLedger.query.filter_by(product_id=p_id, transaction_type="DELIVERY").first()
    assert ledger is not None
    assert ledger.previous_quantity == 50.0
    assert ledger.new_quantity == 30.0
