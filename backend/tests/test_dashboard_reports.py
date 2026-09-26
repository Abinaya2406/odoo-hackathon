def test_health_check_endpoint(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert data["message"] == "StockSense API is running"

def test_dashboard_endpoint(client, auth_headers, seed_data):
    res = client.get("/api/dashboard", headers=auth_headers)
    assert res.status_code == 200
    data = res.get_json()["data"]

    assert "total_products" in data
    assert "total_stock" in data
    assert "low_stock_count" in data
    assert "out_of_stock_count" in data
    assert "pending_receipts" in data
    assert "pending_deliveries" in data
    assert "pending_transfers" in data
    assert "inventory_value" in data
    assert "category_wise_stock" in data
    assert "warehouse_wise_stock" in data
    assert "stock_movement_statistics" in data

def test_reports_endpoints(client, auth_headers, seed_data):
    # Inventory valuation report
    res_inv = client.get("/api/reports/inventory", headers=auth_headers)
    assert res_inv.status_code == 200
    assert "summary" in res_inv.get_json()["data"]

    # Stock movement report
    res_mov = client.get("/api/reports/movement", headers=auth_headers)
    assert res_mov.status_code == 200

    # Receipts report
    res_rec = client.get("/api/reports/receipts", headers=auth_headers)
    assert res_rec.status_code == 200

    # Deliveries report
    res_del = client.get("/api/reports/deliveries", headers=auth_headers)
    assert res_del.status_code == 200

    # Adjustments report
    res_adj = client.get("/api/reports/adjustments", headers=auth_headers)
    assert res_adj.status_code == 200

def test_notifications_flow(client, auth_headers):
    # Fetch notifications
    res = client.get("/api/notifications", headers=auth_headers)
    assert res.status_code == 200
    assert "unread_count" in res.get_json()["data"]

    # Mark all read
    read_res = client.put("/api/notifications/read-all", headers=auth_headers)
    assert read_res.status_code == 200
