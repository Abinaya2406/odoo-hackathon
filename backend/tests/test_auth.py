def test_register_user_success(client):
    res = client.post(
        "/api/auth/register",
        json={
            "name": "Jane Doe",
            "email": "jane@example.com",
            "password": "Password123!",
            "role": "INVENTORY_MANAGER",
            "phone": "+1234567890",
        },
    )
    assert res.status_code == 201
    data = res.get_json()
    assert data["success"] is True
    assert "access_token" in data["data"]
    assert data["data"]["user"]["email"] == "jane@example.com"
    assert "password_hash" not in data["data"]["user"]

def test_register_duplicate_email_fails(client):
    payload = {
        "name": "Duplicate User",
        "email": "dup@example.com",
        "password": "Password123!",
        "role": "WAREHOUSE_STAFF",
    }
    res1 = client.post("/api/auth/register", json=payload)
    assert res1.status_code == 201

    res2 = client.post("/api/auth/register", json=payload)
    assert res2.status_code == 409
    assert res2.get_json()["success"] is False

def test_login_success_and_failure(client):
    # Register first
    client.post(
        "/api/auth/register",
        json={"name": "Bob", "email": "bob@example.com", "password": "SecretPassword123!"},
    )

    # Success
    res = client.post(
        "/api/auth/login",
        json={"email": "bob@example.com", "password": "SecretPassword123!"},
    )
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert "access_token" in data["data"]

    # Wrong password
    res_bad = client.post(
        "/api/auth/login",
        json={"email": "bob@example.com", "password": "WrongPassword!"},
    )
    assert res_bad.status_code == 401
    assert res_bad.get_json()["success"] is False

def test_get_me_profile(client, auth_headers):
    res = client.get("/api/auth/me", headers=auth_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert data["data"]["email"] == "admin@stocksense.test"
    assert data["data"]["role"] == "ADMIN"

def test_forgot_and_reset_password_flow(client):
    # 1. Register user
    client.post(
        "/api/auth/register",
        json={"name": "Alice", "email": "alice@example.com", "password": "OldPassword123!"},
    )

    # 2. Forgot password
    forgot_res = client.post("/api/auth/forgot-password", json={"email": "alice@example.com"})
    assert forgot_res.status_code == 200
    otp = forgot_res.get_json()["data"]["otp_preview"]
    assert len(otp) == 6

    # 3. Verify OTP
    verify_res = client.post(
        "/api/auth/verify-otp",
        json={"email": "alice@example.com", "otp": otp},
    )
    assert verify_res.status_code == 200

    # 4. Reset password
    reset_res = client.post(
        "/api/auth/reset-password",
        json={"email": "alice@example.com", "otp": otp, "new_password": "NewSecretPassword123!"},
    )
    assert reset_res.status_code == 200

    # 5. Login with new password
    login_res = client.post(
        "/api/auth/login",
        json={"email": "alice@example.com", "password": "NewSecretPassword123!"},
    )
    assert login_res.status_code == 200
