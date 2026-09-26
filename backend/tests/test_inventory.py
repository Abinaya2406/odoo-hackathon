from app.extensions import db
from app.models.stock import Stock

def test_inventory_stock_status_calculation(client, auth_headers, seed_data):
    p1_id = seed_data["product_1_id"]
    wh1_id = seed_data["warehouse_1_id"]
    loc1_id = seed_data["location_1_id"]

    # Initial state: 0 stock -> OUT_OF_STOCK
    res = client.get(f"/api/inventory/product/{p1_id}", headers=auth_headers)
    assert res.status_code == 200
    assert res.get_json()["data"]["stock_status"] == "OUT_OF_STOCK"

    # Add 10 units (minimum_stock is 15.0) -> LOW_STOCK
    stock = Stock(product_id=p1_id, warehouse_id=wh1_id, location_id=loc1_id, quantity=10.0)
    db.session.add(stock)
    db.session.commit()

    res_low = client.get(f"/api/inventory/product/{p1_id}", headers=auth_headers)
    assert res_low.get_json()["data"]["stock_status"] == "LOW_STOCK"

    # Add more units -> IN_STOCK (total 100 > minimum 15)
    stock.quantity = 100.0
    db.session.commit()

    res_in = client.get(f"/api/inventory/product/{p1_id}", headers=auth_headers)
    assert res_in.get_json()["data"]["stock_status"] == "IN_STOCK"

def test_inventory_warehouse_endpoint(client, auth_headers, seed_data):
    wh1_id = seed_data["warehouse_1_id"]
    res = client.get(f"/api/inventory/warehouse/{wh1_id}", headers=auth_headers)
    assert res.status_code == 200
    data = res.get_json()["data"]
    assert data["warehouse_id"] == wh1_id
