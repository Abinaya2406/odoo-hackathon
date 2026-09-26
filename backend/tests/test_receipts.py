from app.extensions import db
from app.models.stock import Stock
from app.models.stock_ledger import StockLedger

def test_receipt_validation_increases_stock_exact(client, auth_headers, seed_data):
    """
    CRITICAL SPECIFICATION TEST:
    If stock = 50, Receipt = 25, Final stock must = 75.
    """
    p_id = seed_data["product_1_id"]
    wh_id = seed_data["warehouse_1_id"]
    loc_id = seed_data["location_1_id"]

    # Initialize existing stock = 50
    initial_stock = Stock(product_id=p_id, warehouse_id=wh_id, location_id=loc_id, quantity=50.0)
    db.session.add(initial_stock)
    db.session.commit()

    # Create receipt for 25 units
    res = client.post(
        "/api/receipts",
        headers=auth_headers,
        json={
            "warehouse_id": wh_id,
            "items": [
                {"product_id": p_id, "quantity": 25.0, "location_id": loc_id}
            ],
            "notes": "Incoming replenishment shipment",
        },
    )
    assert res.status_code == 201
    receipt_id = res.get_json()["data"]["id"]

    # Validate receipt
    val_res = client.post(f"/api/receipts/{receipt_id}/validate", headers=auth_headers)
    assert val_res.status_code == 200
    assert val_res.get_json()["data"]["status"] == "DONE"

    # Verify final stock is exactly 75.0
    stock_after = Stock.query.filter_by(product_id=p_id, location_id=loc_id).first()
    assert stock_after.quantity == 75.0

    # Verify Stock Ledger record was created
    ledger = StockLedger.query.filter_by(product_id=p_id, transaction_type="RECEIPT").first()
    assert ledger is not None
    assert ledger.quantity == 25.0
    assert ledger.previous_quantity == 50.0
    assert ledger.new_quantity == 75.0

def test_cannot_validate_receipt_twice(client, auth_headers, seed_data):
    p_id = seed_data["product_1_id"]
    wh_id = seed_data["warehouse_1_id"]
    loc_id = seed_data["location_1_id"]

    res = client.post(
        "/api/receipts",
        headers=auth_headers,
        json={
            "warehouse_id": wh_id,
            "items": [{"product_id": p_id, "quantity": 10.0, "location_id": loc_id}],
        },
    )
    receipt_id = res.get_json()["data"]["id"]

    # First validation -> 200
    res1 = client.post(f"/api/receipts/{receipt_id}/validate", headers=auth_headers)
    assert res1.status_code == 200

    # Second validation -> 400
    res2 = client.post(f"/api/receipts/{receipt_id}/validate", headers=auth_headers)
    assert res2.status_code == 400
