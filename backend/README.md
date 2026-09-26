# StockSense - AI-Powered Inventory Management Backend API

StockSense is a centralized, production-ready RESTful inventory management platform designed to manage products, warehouses, multi-location stock, incoming receipts, outgoing delivery orders, internal transfers, physical stock adjustments, immutable audit ledgers, automated alerts/notifications, business intelligence reporting, and AI-driven predictive insights.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [Folder Structure](#folder-structure)
5. [Installation & Prerequisites](#installation--prerequisites)
6. [Environment Configuration](#environment-configuration)
7. [MySQL Database Setup](#mysql-database-setup)
8. [Database Migrations](#database-migrations)
9. [Running the Server](#running-the-server)
10. [API Endpoint Documentation](#api-endpoint-documentation)
11. [Authentication & Authorization](#authentication--authorization)
12. [Business Rules & Transaction Integrity](#business-rules--transaction-integrity)
13. [Testing Instructions](#testing-instructions)
14. [Connecting to React Frontend](#connecting-to-react-frontend)

---

## 1. Project Overview
StockSense provides a modular backend architecture adhering to domain-driven service boundaries:
- **Routes Layer**: Accepts HTTP requests, parses query parameters, passes data to Schemas and Services.
- **Service Layer**: Houses core business logic, atomic transaction handling, and domain validations.
- **Schema Layer**: Uses Marshmallow for strict request/response data contracts and input sanitation.
- **Model Layer**: SQLAlchemy ORM models with relational constraints, foreign keys, and soft-deletion.
- **AI/ML Layer**: Dedicated modules leveraging NumPy, Pandas, and Scikit-Learn for demand forecasting, reorder point optimization, and transaction anomaly detection.

---

## 2. Key Features

- **Multi-Warehouse & Multi-Location Stock**: Manage warehouses with granular location rack numbering and unique product-location constraints.
- **Transactional Stock Operations**:
  - **Receipts**: Multi-item supplier purchase receipts that atomically update inventory and generate ledger audit trails.
  - **Deliveries**: Customer order fulfillment with pre-validation against available stock levels. Deliveries fail with HTTP 400 if stock is insufficient.
  - **Internal Transfers**: Relocate stock across warehouses and locations without changing total company stock (double-entry `TRANSFER_OUT` and `TRANSFER_IN` ledgers).
  - **Stock Adjustments**: Reconcile physical inventory counts against system database records with automatic discrepancy calculations (`difference = physical_quantity - system_quantity`).
- **Immutable Stock Ledger**: Full audit log capturing every single stock modification with transaction type, reference identifiers, timestamps, and before/after stock levels.
- **AI Module**:
  - **Demand Forecasting**: Scikit-Learn linear regression and moving average models predicting 30-day product demand with confidence scores.
  - **Smart Reorder Advisor**: Calculates safety stock, predicted demand, reorder levels, and recommended order quantities categorized by urgency (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
  - **Anomaly Detection**: Statistical deviation and Z-score outlier detection identifying suspicious or oversized stock movements.
- **Automated Alerts & Notifications**: Real-time notifications for `LOW_STOCK`, `OUT_OF_STOCK`, operations, and AI alerts.
- **Consolidated Dashboard**: Single fast API endpoint (`/api/dashboard`) designed for low-latency React frontend rendering.
- **Reporting Engine**: Dedicated reports for inventory valuation, stock movements, receipts, deliveries, and adjustments.

---

## 3. Technology Stack

- **Language**: Python 3.12+
- **Framework**: Flask 3.1+
- **Database & ORM**: MySQL with SQLAlchemy 2.0+ (PyMySQL driver)
- **Migrations**: Flask-Migrate & Alembic
- **Authentication**: Flask-JWT-Extended (HMAC-SHA256, role claims) & Werkzeug security password hashing
- **Serialization & Validation**: Marshmallow
- **Cross-Origin Resource Sharing**: Flask-CORS
- **Environment Management**: python-dotenv
- **Machine Learning & Analytics**: Pandas, NumPy, Scikit-learn
- **Test Suite**: Pytest (with in-memory SQLite support for zero-dependency test execution)

---

## 4. Folder Structure

```
backend/
├── app.py                     # Application entrypoint & CLI commands
├── config.py                  # Environment-specific configuration classes
├── requirements.txt           # Python dependencies
├── .env                       # Local environment variables
├── .env.example               # Template environment configuration
├── README.md                  # Comprehensive backend documentation
│
├── app/
│   ├── __init__.py            # Flask application factory, error handlers, and JWT callbacks
│   ├── extensions.py          # SQLAlchemy, JWTManager, Migrate, and CORS instances
│   │
│   ├── models/                # SQLAlchemy database entities
│   │   ├── __init__.py
│   │   ├── user.py            # User credentials, roles, OTP reset
│   │   ├── product.py         # Product master data & soft delete
│   │   ├── category.py        # Product categories
│   │   ├── supplier.py        # Suppliers and vendors
│   │   ├── warehouse.py       # Warehouse facilities
│   │   ├── location.py        # Racks and storage bins
│   │   ├── stock.py           # Product-location inventory quantities
│   │   ├── receipt.py         # Receipts & ReceiptItems
│   │   ├── delivery.py        # Deliveries & DeliveryItems
│   │   ├── transfer.py        # Internal stock transfer orders
│   │   ├── adjustment.py      # Stock adjustment audits
│   │   ├── stock_ledger.py    # Immutable stock transaction log
│   │   └── notification.py    # System & inventory notifications
│   │
│   ├── routes/                # REST API endpoints (Blueprints)
│   │   ├── __init__.py        # Blueprint registration & /api/health
│   │   ├── auth_routes.py
│   │   ├── product_routes.py
│   │   ├── category_routes.py
│   │   ├── warehouse_routes.py
│   │   ├── inventory_routes.py
│   │   ├── receipt_routes.py
│   │   ├── delivery_routes.py
│   │   ├── transfer_routes.py
│   │   ├── adjustment_routes.py
│   │   ├── ledger_routes.py
│   │   ├── notification_routes.py
│   │   ├── dashboard_routes.py
│   │   ├── report_routes.py
│   │   └── ai_routes.py
│   │
│   ├── services/              # Business logic & transaction orchestration
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── product_service.py
│   │   ├── inventory_service.py
│   │   ├── warehouse_service.py
│   │   ├── receipt_service.py
│   │   ├── delivery_service.py
│   │   ├── transfer_service.py
│   │   ├── adjustment_service.py
│   │   ├── ledger_service.py
│   │   └── notification_service.py
│   │
│   ├── ai/                    # Machine Learning and analytics services
│   │   ├── __init__.py
│   │   ├── demand_prediction.py
│   │   ├── smart_reorder.py
│   │   └── anomaly_detection.py
│   │
│   ├── schemas/               # Marshmallow request/response validation schemas
│   │   ├── __init__.py
│   │   ├── user_schema.py
│   │   ├── product_schema.py
│   │   ├── receipt_schema.py
│   │   ├── delivery_schema.py
│   │   ├── transfer_schema.py
│   │   └── adjustment_schema.py
│   │
│   └── utils/                 # Helpers, security decorators, and validators
│       ├── __init__.py
│       ├── auth.py
│       ├── validators.py
│       ├── decorators.py
│       └── helpers.py
│
├── migrations/                # Database migration scripts
│
└── tests/                     # Automated unit and integration test suite
    ├── conftest.py            # Test fixtures, DB isolation, and mock tokens
    ├── test_auth.py
    ├── test_products.py
    ├── test_inventory.py
    ├── test_receipts.py
    ├── test_deliveries.py
    ├── test_transfers.py
    ├── test_adjustments.py
    ├── test_ai.py
    └── test_dashboard_reports.py
```

---

## 5. Installation & Prerequisites

1. **Python 3.12+** installed on your system.
2. **MySQL Server 8.0+** running locally or remotely.
3. Open a terminal in the `backend/` directory:
   ```bash
   cd backend
   ```
4. Create and activate a Python virtual environment (recommended):
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # Linux / macOS
   python3 -m venv venv
   source venv/bin/activate
   ```
5. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

---

## 6. Environment Configuration

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure your environment settings:
```ini
FLASK_APP=app.py
FLASK_ENV=development
DEBUG=True
PORT=5000

SECRET_KEY=change-this-to-a-super-secret-production-key
JWT_SECRET_KEY=change-this-to-a-secure-jwt-secret-key
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

---

## 7. MySQL Database Setup

1. Log into your MySQL server:
   ```sql
   mysql -u root -p
   ```
2. Create the database:
   ```sql
   CREATE DATABASE stocksense CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Verify connection by running the database initialization command:
   ```bash
   flask init-db
   ```

---

## 8. Database Migrations

Initialize and apply database migrations using Flask-Migrate:

```bash
# 1. Initialize migration repository (one-time setup)
flask db init

# 2. Generate a migration script based on models
flask db migrate -m "Initial StockSense schema"

# 3. Apply the migration to your MySQL database
flask db upgrade
```

---

## 9. Running the Server

Start the development server:
```bash
python app.py
```

The server will bind to `http://0.0.0.0:5000`.

Verify server health:
```bash
curl http://localhost:5000/api/health
```
Response:
```json
{
  "success": true,
  "message": "StockSense API is running"
}
```

---

## 10. API Endpoint Documentation

All successful responses follow the standard format:
```json
{
  "success": true,
  "message": "Description of outcome",
  "data": { ... }
}
```
All error responses follow:
```json
{
  "success": false,
  "message": "Error description",
  "errors": { ... }
}
```

### Authentication & Profile (`/api/auth`)
| Method | Endpoint | Description | Role / Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user (`name`, `email`, `password`, `role`) | Public |
| `POST` | `/api/auth/login` | Login with credentials; returns JWT `access_token` & user profile | Public |
| `POST` | `/api/auth/forgot-password` | Generate 6-digit password reset OTP | Public |
| `POST` | `/api/auth/verify-otp` | Verify 6-digit OTP code | Public |
| `POST` | `/api/auth/reset-password` | Reset password using verified OTP | Public |
| `GET` | `/api/auth/me` | Fetch currently authenticated user profile | Authenticated |
| `POST` | `/api/auth/logout` | Invalidate/logout session | Authenticated |

### Products (`/api/products`)
| Method | Endpoint | Description | Role / Auth |
|---|---|---|---|
| `GET` | `/api/products` | List products with search (`search`), category (`category_id`), warehouse (`warehouse_id`), status (`stock_status`), and pagination | Authenticated |
| `GET` | `/api/products/<id>` | Get product by ID with warehouse stock breakdown | Authenticated |
| `POST` | `/api/products` | Create product (unique SKU required) | ADMIN, INVENTORY_MANAGER |
| `PUT` | `/api/products/<id>` | Update product details | ADMIN, INVENTORY_MANAGER |
| `DELETE` | `/api/products/<id>` | Soft delete product (preserves ledger integrity) | ADMIN |

### Categories (`/api/categories`)
| Method | Endpoint | Description | Role / Auth |
|---|---|---|---|
| `GET` | `/api/categories` | List all active product categories | Authenticated |
| `POST` | `/api/categories` | Create product category | ADMIN, INVENTORY_MANAGER |
| `PUT` | `/api/categories/<id>` | Update category | ADMIN, INVENTORY_MANAGER |
| `DELETE` | `/api/categories/<id>` | Soft delete category | ADMIN |

### Warehouses & Locations (`/api/warehouses`)
| Method | Endpoint | Description | Role / Auth |
|---|---|---|---|
| `GET` | `/api/warehouses` | List warehouses with pagination | Authenticated |
| `GET` | `/api/warehouses/<id>` | Get warehouse details and locations | Authenticated |
| `POST` | `/api/warehouses` | Create warehouse | ADMIN |
| `PUT` | `/api/warehouses/<id>` | Update warehouse | ADMIN |
| `DELETE` | `/api/warehouses/<id>` | Delete warehouse (only if empty of stock) | ADMIN |
| `GET` | `/api/warehouses/<id>/locations` | List storage locations in warehouse | Authenticated |
| `POST` | `/api/warehouses/<id>/locations` | Add storage location/rack | ADMIN, INVENTORY_MANAGER |
| `GET` | `/api/warehouses/suppliers` | List suppliers | Authenticated |
| `POST` | `/api/warehouses/suppliers` | Create supplier | ADMIN, INVENTORY_MANAGER |

### Inventory & Stock (`/api/inventory`)
| Method | Endpoint | Description | Role / Auth |
|---|---|---|---|
| `GET` | `/api/inventory` | Multi-warehouse stock inventory with status filters (`low_stock`, `out_of_stock`) | Authenticated |
| `GET` | `/api/inventory/product/<id>` | Aggregated product stock across all locations | Authenticated |
| `GET` | `/api/inventory/warehouse/<id>`| Breakdown of all products inside a warehouse | Authenticated |

### Receipts (`/api/receipts`)
| Method | Endpoint | Description | Role / Auth |
|---|---|---|---|
| `GET` | `/api/receipts` | List purchase receipts | Authenticated |
| `GET` | `/api/receipts/<id>` | Get receipt by ID | Authenticated |
| `POST` | `/api/receipts` | Create receipt draft with items | Authenticated |
| `PUT` | `/api/receipts/<id>` | Update receipt details/items | Authenticated |
| `DELETE`| `/api/receipts/<id>` | Delete receipt (only if not DONE) | Authenticated |
| `POST` | `/api/receipts/<id>/validate` | Atomically validate receipt, increase stock, and record ledger | Authenticated |

### Deliveries (`/api/deliveries`)
| Method | Endpoint | Description | Role / Auth |
|---|---|---|---|
| `GET` | `/api/deliveries` | List customer delivery orders | Authenticated |
| `GET` | `/api/deliveries/<id>` | Get delivery order by ID | Authenticated |
| `POST` | `/api/deliveries` | Create delivery order draft with items | Authenticated |
| `PUT` | `/api/deliveries/<id>` | Update delivery order details/items | Authenticated |
| `DELETE`| `/api/deliveries/<id>` | Delete delivery order (only if not DONE) | Authenticated |
| `POST` | `/api/deliveries/<id>/validate` | Validate delivery: verifies sufficient stock, decreases stock, logs ledger. Fails with HTTP 400 if stock is insufficient. | Authenticated |

### Internal Transfers (`/api/transfers`)
| Method | Endpoint | Description | Role / Auth |
|---|---|---|---|
| `GET` | `/api/transfers` | List stock transfer orders | Authenticated |
| `GET` | `/api/transfers/<id>` | Get transfer order by ID | Authenticated |
| `POST` | `/api/transfers` | Create stock transfer draft | Authenticated |
| `PUT` | `/api/transfers/<id>` | Update transfer draft | Authenticated |
| `POST` | `/api/transfers/<id>/validate` | Atomically relocate stock: decreases source, increases destination, generates TRANSFER_OUT and TRANSFER_IN ledgers | Authenticated |

### Stock Adjustments (`/api/adjustments`)
| Method | Endpoint | Description | Role / Auth |
|---|---|---|---|
| `GET` | `/api/adjustments` | List stock reconciliation adjustments | Authenticated |
| `GET` | `/api/adjustments/<id>` | Get adjustment details | Authenticated |
| `POST` | `/api/adjustments` | Record physical audit: computes `difference = physical - system`, updates stock, logs ledger | Authenticated |

### Stock Ledger (`/api/ledger`)
| Method | Endpoint | Description | Role / Auth |
|---|---|---|---|
| `GET` | `/api/ledger` | Query stock audit log with filters (`product_id`, `warehouse_id`, `transaction_type`, date range) | Authenticated |
| `GET` | `/api/ledger/product/<id>` | Full historical stock trail for a specific product | Authenticated |

### Dashboard (`/api/dashboard`)
| Method | Endpoint | Description | Role / Auth |
|---|---|---|---|
| `GET` | `/api/dashboard` | Consolidated metrics: product count, stock totals, low stock, out of stock, pending operations, valuation, movement stats, category breakdown, warehouse utilization | Authenticated |

### Notifications (`/api/notifications`)
| Method | Endpoint | Description | Role / Auth |
|---|---|---|---|
| `GET` | `/api/notifications` | List user/system notifications | Authenticated |
| `PUT` | `/api/notifications/<id>/read` | Mark single notification as read | Authenticated |
| `PUT` | `/api/notifications/read-all` | Mark all notifications as read | Authenticated |
| `DELETE`| `/api/notifications/<id>` | Delete notification | Authenticated |

### Reports (`/api/reports`)
| Method | Endpoint | Description | Role / Auth |
|---|---|---|---|
| `GET` | `/api/reports/inventory` | Inventory valuation and stock status report | Authenticated |
| `GET` | `/api/reports/movement` | Stock movement volume and transaction frequency | Authenticated |
| `GET` | `/api/reports/receipts` | Supplier receipt volume and status report | Authenticated |
| `GET` | `/api/reports/deliveries` | Customer delivery dispatch report | Authenticated |
| `GET` | `/api/reports/adjustments` | Audit discrepancies and reconciliation report | Authenticated |

### AI & Analytics (`/api/ai`)
| Method | Endpoint | Description | Role / Auth |
|---|---|---|---|
| `GET` | `/api/ai/forecast/<product_id>` | Linear regression & moving average demand forecast for next 30 days | Authenticated |
| `GET` | `/api/ai/reorder` | Smart reorder advisor: computes safety stock, 30d predicted demand, and suggested order quantities ranked by urgency | Authenticated |
| `GET` | `/api/ai/anomalies` | Statistical Z-score anomaly detector identifying unusual or oversized transactions | Authenticated |

---

## 11. Authentication & Authorization

Protected endpoints require a valid JWT bearer token in the `Authorization` header:
```http
Authorization: Bearer <your_jwt_access_token>
```

### Roles:
- **`ADMIN`**: Full administrative access across all endpoints, configuration, deletion, and role management.
- **`INVENTORY_MANAGER`**: Can create and edit products, categories, suppliers, warehouses, receipts, deliveries, and adjustments.
- **`WAREHOUSE_STAFF`**: Can view inventory, create draft orders, record movements, and validate transfers.

Passwords are cryptographically salted and hashed using Werkzeug (`scrypt` / `pbkdf2:sha256`) and are excluded from all API responses.

---

## 12. Business Rules & Transaction Integrity

1. **RULE 1 - Non-Negative Stock**: Stock quantities are protected by database check constraints and validation guards. Stock can never become negative.
2. **RULE 2 - Delivery Stock Guard**: Deliveries cannot be validated if sufficient stock is unavailable. The API returns HTTP 400 with `{"message": "Insufficient stock"}`.
3. **RULE 3 - Receipt Increment**: Receipt validation strictly increases available stock.
4. **RULE 4 - Delivery Decrement**: Delivery validation strictly decreases available stock.
5. **RULE 5 - Transfer Invariance**: Internal transfers decrease source location stock and increase destination location stock. Total company stock remains invariant.
6. **RULE 6 - Adjustment Reconciliation**: Adjustments set the stock to `physical_quantity` and record the signed `difference`.
7. **RULE 7 - Full Audit Trail**: Every inventory-modifying operation creates an immutable entry in the `stock_ledger` table.
8. **RULE 8 - Unique SKU**: Product SKUs are unique and case-insensitive.
9. **RULE 9 - Unique Email**: User email addresses must be unique.
10. **RULE 10 - Soft Deletion**: Deleted products are soft-deleted (`is_deleted=True`) to maintain foreign key integrity across historical transactions and ledger records.
11. **Atomic Transactions**: All inventory changes (stock updates, ledger insertions, order status updates, notifications) execute in a single atomic database transaction. If any step fails, the entire transaction is rolled back.

---

## 13. Testing Instructions

The test suite runs with an isolated in-memory SQLite database so tests execute quickly and reliably without requiring an external MySQL server.

Run all tests:
```bash
python -m pytest tests/ -v
```

Execute a specific test module:
```bash
python -m pytest tests/test_deliveries.py -v
python -m pytest tests/test_transfers.py -v
python -m pytest tests/test_receipts.py -v
python -m pytest tests/test_adjustments.py -v
```

All 27 automated tests cover:
- Authentication & JWT token validation
- Product CRUD, unique SKU checks, and soft deletion
- Inventory queries and stock status calculations (`IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`)
- Receipt validation: `50 + 25 = 75` rule verification
- Delivery validation: `stock = 10, delivery = 20` rejection with HTTP 400
- Transfer validation: `Source 100 -> 80, Destination 30 -> 50` rule verification
- Stock adjustments: `difference = physical - system` reconciliation
- AI forecasting, smart reorder urgency ranking, and anomaly detection
- Dashboard metrics and reporting endpoints

---

## 14. Connecting to React Frontend

This backend is built for frontend integration:
- **CORS Configured**: CORS allows incoming requests from `http://localhost:3000`, `http://localhost:5173` (Vite), or custom origins defined in `.env`.
- **Consistent JSON Format**: Every API response adheres to `{ "success": boolean, "message": string, "data": ... }`.
- **Consolidated Dashboard**: React dashboards can load all key operational statistics in a single call to `/api/dashboard`.
- **JWT Storage**: Frontend applications can store `access_token` in `localStorage` or `sessionStorage` and send it in the `Authorization: Bearer <token>` header for all authenticated requests.
