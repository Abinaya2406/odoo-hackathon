def test_create_product_success(client, auth_headers, seed_data):
    cat_id = seed_data["category_id"]
    res = client.post(
        "/api/products",
        headers=auth_headers,
        json={
            "name": "Resistor 10k Ohm",
            "sku": "RES-10K",
            "category_id": cat_id,
            "unit_of_measure": "pcs",
            "minimum_stock": 100.0,
            "maximum_stock": 5000.0,
            "reorder_quantity": 500.0,
            "cost_price": 0.05,
        },
    )
    assert res.status_code == 201
    data = res.get_json()
    assert data["success"] is True
    assert data["data"]["sku"] == "RES-10K"

def test_duplicate_sku_rejected(client, auth_headers, seed_data):
    # Try creating product with duplicate SKU MCU-328P
    res = client.post(
        "/api/products",
        headers=auth_headers,
        json={
            "name": "Duplicate Board",
            "sku": "MCU-328P",
            "minimum_stock": 10.0,
        },
    )
    assert res.status_code == 409
    assert res.get_json()["success"] is False

def test_get_products_with_search_and_filter(client, auth_headers, seed_data):
    # Search by keyword
    res = client.get("/api/products?search=Microcontroller", headers=auth_headers)
    assert res.status_code == 200
    items = res.get_json()["data"]
    assert len(items) == 1
    assert items[0]["sku"] == "MCU-328P"

    # Search by SKU
    res_sku = client.get("/api/products?search=OLED", headers=auth_headers)
    assert res_sku.status_code == 200
    assert len(res_sku.get_json()["data"]) == 1

def test_soft_delete_product(client, auth_headers, seed_data):
    p_id = seed_data["product_2_id"]
    del_res = client.delete(f"/api/products/{p_id}", headers=auth_headers)
    assert del_res.status_code == 200

    # Ensure it no longer appears in active list
    get_res = client.get(f"/api/products/{p_id}", headers=auth_headers)
    assert get_res.status_code == 404

def test_category_crud(client, auth_headers):
    # Create category
    create_res = client.post(
        "/api/categories",
        headers=auth_headers,
        json={"name": "Packaging", "description": "Boxes and packing materials"},
    )
    assert create_res.status_code == 201
    cat_id = create_res.get_json()["data"]["id"]

    # Update category
    upd_res = client.put(
        f"/api/categories/{cat_id}",
        headers=auth_headers,
        json={"name": "Packaging Materials"},
    )
    assert upd_res.status_code == 200
    assert upd_res.get_json()["data"]["name"] == "Packaging Materials"

    # Delete category
    del_res = client.delete(f"/api/categories/{cat_id}", headers=auth_headers)
    assert del_res.status_code == 200
