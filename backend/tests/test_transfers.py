from app.extensions import db
from app.models.stock import Stock
from app.models.stock_ledger import StockLedger

def test_transfer_validation_exact_numbers(client, auth_headers, seed_data):
    """
    CRITICAL SPECIFICATION TEST:
    Transfer 20:
    Source = 100 -> 80
    Destination = 30 -> 50
    """
    p_id = seed_data["product_1_id"]
    src_wh_id = seed_data["warehouse_1_id"]
    src_loc_id = seed_data["location_1_id"]
    dst_wh_id = seed_data["warehouse_2_id"]
    dst_loc_id = seed_data["location_3_id"]

    # Source stock = 100
    src_stock = Stock(product_id=p_id, warehouse_id=src_wh_id, location_id=src_loc_id, quantity=100.0)
    # Destination stock = 30
    dst_stock = Stock(product_id=p_id, warehouse_id=dst_wh_id, location_id=dst_loc_id, quantity=30.0)
    db.session.add_all([src_stock, dst_stock])
    db.session.commit()

    # Initial total company stock = 130
    total_before = src_stock.quantity + dst_stock.quantity
    assert total_before == 130.0

    # Create transfer order for 20 units
    res = client.post(
        "/api/transfers",
        headers=auth_headers,
        json={
            "product_id": p_id,
            "quantity": 20.0,
            "source_warehouse_id": src_wh_id,
            "source_location_id": src_loc_id,
            "destination_warehouse_id": dst_wh_id,
            "destination_location_id": dst_loc_id,
            "notes": "Relocating inventory to West Coast Annex",
        },
    )
    assert res.status_code == 201
    transfer_id = res.get_json()["data"]["id"]

    # Validate transfer
    val_res = client.post(f"/api/transfers/{transfer_id}/validate", headers=auth_headers)
    assert val_res.status_code == 200
    assert val_res.get_json()["data"]["status"] == "DONE"

    # Verify final stock levels
    src_after = Stock.query.filter_by(product_id=p_id, location_id=src_loc_id).first()
    dst_after = Stock.query.filter_by(product_id=p_id, location_id=dst_loc_id).first()

    assert src_after.quantity == 80.0
    assert dst_after.quantity == 50.0

    # Total company stock must remain invariant
    total_after = src_after.quantity + dst_after.quantity
    assert total_after == 130.0

    # Check both ledger entries: TRANSFER_OUT and TRANSFER_IN
    out_ledger = StockLedger.query.filter_by(product_id=p_id, transaction_type="TRANSFER_OUT").first()
    in_ledger = StockLedger.query.filter_by(product_id=p_id, transaction_type="TRANSFER_IN").first()

    assert out_ledger is not None
    assert out_ledger.previous_quantity == 100.0
    assert out_ledger.new_quantity == 80.0

    assert in_ledger is not None
    assert in_ledger.previous_quantity == 30.0
    assert in_ledger.new_quantity == 50.0

def test_transfer_insufficient_source_stock_fails(client, auth_headers, seed_data):
    p_id = seed_data["product_1_id"]
    src_wh_id = seed_data["warehouse_1_id"]
    src_loc_id = seed_data["location_1_id"]
    dst_wh_id = seed_data["warehouse_2_id"]
    dst_loc_id = seed_data["location_3_id"]

    # Source stock = 5
    src_stock = Stock(product_id=p_id, warehouse_id=src_wh_id, location_id=src_loc_id, quantity=5.0)
    db.session.add(src_stock)
    db.session.commit()

    # Transfer 20
    res = client.post(
        "/api/transfers",
        headers=auth_headers,
        json={
            "product_id": p_id,
            "quantity": 20.0,
            "source_warehouse_id": src_wh_id,
            "source_location_id": src_loc_id,
            "destination_warehouse_id": dst_wh_id,
            "destination_location_id": dst_loc_id,
        },
    )
    transfer_id = res.get_json()["data"]["id"]

    val_res = client.post(f"/api/transfers/{transfer_id}/validate", headers=auth_headers)
    assert val_res.status_code == 400
    assert "Insufficient stock" in val_res.get_json()["message"]
