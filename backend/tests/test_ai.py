from app.extensions import db
from app.models.stock import Stock
from app.models.stock_ledger import StockLedger

def test_demand_forecast_endpoint(client, auth_headers, seed_data):
    p_id = seed_data["product_1_id"]
    res = client.get(f"/api/ai/forecast/{p_id}", headers=auth_headers)
    assert res.status_code == 200
    data = res.get_json()["data"]
    assert "predicted_demand" in data
    assert "confidence_score" in data
    assert data["product"]["id"] == p_id

def test_smart_reorder_endpoint(client, auth_headers, seed_data):
    res = client.get("/api/ai/reorder", headers=auth_headers)
    assert res.status_code == 200
    data = res.get_json()["data"]
    assert isinstance(data, list)
    assert len(data) >= 2
    first_item = data[0]
    assert "recommended_order_quantity" in first_item
    assert "urgency" in first_item
    assert "safety_stock" in first_item

def test_anomaly_detection_endpoint(client, auth_headers, seed_data):
    p_id = seed_data["product_1_id"]
    wh_id = seed_data["warehouse_1_id"]
    loc_id = seed_data["location_1_id"]

    # Seed some standard entries (normal transactions: 10, 12, 11, 10, 9)
    for q in [10.0, 12.0, 11.0, 10.0, 9.0]:
        e = StockLedger(
            product_id=p_id,
            warehouse_id=wh_id,
            location_id=loc_id,
            transaction_type="DELIVERY",
            quantity=-q,
            reference_id="DEL-NORM",
            previous_quantity=100.0,
            new_quantity=100.0 - q,
        )
        db.session.add(e)

    # Seed an anomalous outlier (150.0 units)
    anomaly_entry = StockLedger(
        product_id=p_id,
        warehouse_id=wh_id,
        location_id=loc_id,
        transaction_type="DELIVERY",
        quantity=-150.0,
        reference_id="DEL-ANOMALY",
        previous_quantity=200.0,
        new_quantity=50.0,
    )
    db.session.add(anomaly_entry)
    db.session.commit()

    res = client.get("/api/ai/anomalies", headers=auth_headers)
    assert res.status_code == 200
    anomalies = res.get_json()["data"]
    assert len(anomalies) >= 1
    flagged = anomalies[0]
    assert flagged["detected_quantity"] == 150.0
    assert flagged["status"] == "FLAGGED"
