# StockSense Backend - How to Run Guide

This guide provides clear, step-by-step instructions to set up, configure, run, and test the **StockSense Backend REST API**.

---

## 📋 Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Step-by-Step Quick Start](#2-step-by-step-quick-start)
3. [Environment Configuration (.env)](#3-environment-configuration-env)
4. [Database Setup (MySQL)](#4-database-setup-mysql)
5. [Starting the Application](#5-starting-the-application)
6. [Verifying Server Health](#6-verifying-server-health)
7. [Running Automated Tests](#7-running-automated-tests)
8. [Sample API Testing Workflow (cURL / Postman)](#8-sample-api-testing-workflow-curl--postman)
9. [Troubleshooting & FAQs](#9-troubleshooting--faqs)

---

## 1. Prerequisites

Before running the backend, make sure you have:
- **Python 3.10+** (Tested on Python 3.12)
- **MySQL 8.0+** (or MySQL MariaDB).
  > **Note**: For zero-setup local testing or running pytest, the application automatically supports SQLite in-memory without requiring a running MySQL server.
- **Git** (optional)
- **Postman, Insomnia, or cURL** (for testing REST API endpoints)

---

## 2. Step-by-Step Quick Start

Open your terminal or command prompt and navigate to the `backend/` directory:

```bash
cd backend
```

### Step 2.1: Create & Activate Virtual Environment (Recommended)

**On Windows (PowerShell / CMD):**
```powershell
python -m venv venv
.\venv\Scripts\activate
```

**On macOS / Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 2.2: Install Required Dependencies

```bash
pip install -r requirements.txt
```

---

## 3. Environment Configuration (.env)

A `.env` file is already provided in the `backend/` directory. If you need to reconfigure or create a fresh one, copy from `.env.example`:

**Windows PowerShell:**
```powershell
Copy-Item .env.example .env
```

**Linux / macOS:**
```bash
cp .env.example .env
```

Open `.env` and configure your MySQL credentials and JWT secret key:

```ini
# Flask Config
FLASK_APP=app.py
FLASK_ENV=development
DEBUG=True
PORT=5000

# Security Secrets
SECRET_KEY=stocksense-production-secret-key-2026
JWT_SECRET_KEY=stocksense-jwt-secret-key-2026
JWT_ACCESS_TOKEN_EXPIRES_MINUTES=1440

# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=stocksense
DB_USER=root
DB_PASSWORD=your_mysql_password

# Allowed Frontend Origins (CORS)
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:5000
```

> **Tip for SQLite / Quick Testing**: If you do not have MySQL running right away and want to run the server with a local SQLite file, you can set `DATABASE_URL=sqlite:///stocksense.db` inside your `.env` file.

---

## 4. Database Setup (MySQL)

### Step 4.1: Create MySQL Database

Log in to your MySQL server:
```bash
mysql -u root -p
```

Run SQL command:
```sql
CREATE DATABASE stocksense CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### Step 4.2: Initialize Tables

Run the database initialization command to create all tables:
```bash
python app.py init-db
# or: flask init-db
```
*Output: `Database tables initialized successfully!`*

*(Optional) Alternatively, use Flask-Migrate:*
```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

---

## 5. Starting the Application

Run the server with Python:

```bash
python app.py
```

You should see output similar to:
```text
Starting StockSense Backend on port 5000 (debug=True)...
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
```

The REST API is now live and accepting requests at `http://localhost:5000`!

---

## 6. Verifying Server Health

Test that the server is up and responding:

**Using cURL:**
```bash
curl http://localhost:5000/api/health
```

**Using PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET
```

**Using Browser:**
Open [http://localhost:5000/api/health](http://localhost:5000/api/health) in your web browser.

**Expected Response (HTTP 200):**
```json
{
  "success": true,
  "message": "StockSense API is running"
}
```

---

## 7. Running Automated Tests

The test suite includes 27 comprehensive unit and integration tests covering Authentication, Products, Warehouses, Inventory, Receipts, Deliveries, Transfers, Adjustments, AI modules, and Dashboard reports.

Run all tests:
```bash
python -m pytest tests/ -v
```

Run a specific test module:
```bash
# Test delivery stock guard (Rule: if stock = 10 and delivery = 20, operation is rejected with HTTP 400)
python -m pytest tests/test_deliveries.py -v

# Test transfer validation (Rule: Source 100 -> 80, Dest 30 -> 50)
python -m pytest tests/test_transfers.py -v

# Test receipt validation (Rule: 50 + 25 = 75)
python -m pytest tests/test_receipts.py -v

# Test AI demand forecasting & anomaly detection
python -m pytest tests/test_ai.py -v
```

---

## 8. Sample API Testing Workflow (cURL / Postman)

### Step 8.1: Register an Admin User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Warehouse Admin",
    "email": "admin@stocksense.com",
    "password": "AdminPassword123!",
    "role": "ADMIN",
    "phone": "+1234567890"
  }'
```

### Step 8.2: Login and Copy the `access_token`
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@stocksense.com",
    "password": "AdminPassword123!"
  }'
```
Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOi...",
    "user": {
      "id": 1,
      "email": "admin@stocksense.com",
      "role": "ADMIN"
    }
  }
}
```

> **Note**: For all subsequent private requests, add the header:
> `Authorization: Bearer <your_access_token>`

### Step 8.3: Create a Category
```bash
curl -X POST http://localhost:5000/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Electronics",
    "description": "Sensors and components"
  }'
```

### Step 8.4: Create a Warehouse & Location
```bash
# Create warehouse
curl -X POST http://localhost:5000/api/warehouses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Main Distribution Center",
    "location": "Dallas, TX",
    "capacity": 50000
  }'

# Add a specific storage rack
curl -X POST http://localhost:5000/api/warehouses/1/locations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Section A",
    "rack_number": "RACK-01",
    "capacity": 5000
  }'
```

### Step 8.5: Create a Product
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "IoT Temperature Sensor",
    "sku": "SENS-TMP-01",
    "category_id": 1,
    "unit_of_measure": "pcs",
    "minimum_stock": 20,
    "maximum_stock": 1000,
    "reorder_quantity": 50,
    "cost_price": 14.50
  }'
```

### Step 8.6: Create & Validate an Incoming Receipt
```bash
# 1. Create Receipt Draft
curl -X POST http://localhost:5000/api/receipts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "warehouse_id": 1,
    "items": [
      { "product_id": 1, "quantity": 100, "location_id": 1 }
    ],
    "notes": "Initial inventory delivery"
  }'

# 2. Validate Receipt (Increases stock from 0 to 100 and creates ledger entry)
curl -X POST http://localhost:5000/api/receipts/1/validate \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Step 8.7: Create & Validate an Outgoing Delivery Order
```bash
# 1. Create Delivery Draft
curl -X POST http://localhost:5000/api/deliveries \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "customer_name": "Acme Robotics Corp",
    "warehouse_id": 1,
    "items": [
      { "product_id": 1, "quantity": 30, "location_id": 1 }
    ],
    "notes": "Urgent client dispatch"
  }'

# 2. Validate Delivery (Decreases stock from 100 to 70 and creates ledger entry)
curl -X POST http://localhost:5000/api/deliveries/1/validate \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Step 8.8: Access AI Predictive Endpoints
```bash
# 30-Day Demand Prediction with Confidence Score
curl -X GET http://localhost:5000/api/ai/forecast/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Smart Reorder Urgency Recommendations
curl -X GET http://localhost:5000/api/ai/reorder \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Outlier & Transaction Anomaly Detection
curl -X GET http://localhost:5000/api/ai/anomalies \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Step 8.9: Fetch Consolidated Dashboard
```bash
curl -X GET http://localhost:5000/api/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 9. Troubleshooting & FAQs

### Q1: `Can't connect to MySQL server on 'localhost'`
- Verify MySQL service is started:
  - Windows: Open Services (`services.msc`) → start **MySQL80** / **MySQL**.
  - Linux: `sudo systemctl start mysql`
  - macOS: `brew services start mysql`
- Check your password and port in `.env`.
- Alternatively, test locally by setting `DATABASE_URL=sqlite:///stocksense.db` in `.env`.

### Q2: Port 5000 is already in use
- Change the `PORT` variable in `.env` (e.g., `PORT=5001`).
- Or pass it when running:
  - Windows: `$env:PORT="5001"; python app.py`
  - Linux/Mac: `PORT=5001 python app.py`

### Q3: How to connect this to a React Frontend?
- The backend already has `Flask-CORS` enabled.
- Simply set your React app's API base URL (e.g., in `.env` of React) to `http://localhost:5000/api`.
- When logging in from React, save `data.access_token` in state or `localStorage` and pass it as:
  `headers: { "Authorization": `Bearer ${token}` }` on all API requests.
