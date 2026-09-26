# StockSense - How to Run Frontend & Backend

This guide provides complete, step-by-step instructions to run both the **Backend REST API** and the **React Frontend** for the StockSense Inventory Management System.

---

## 🏗️ Architecture Overview

- **Backend**: Python 3 / Flask / MySQL / SQLAlchemy / Flask-JWT / Scikit-Learn AI
  - Default URL: **`http://localhost:5000`**
  - Health Endpoint: **`http://localhost:5000/api/health`**
- **Frontend**: React 18 / Vite 5 / Tailwind CSS / Lucide React / Recharts
  - Default URL: **`http://localhost:3000`**

```
Browser / Client (http://localhost:3000)
                  │
                  ▼  (REST API calls with JWT Bearer Token)
StockSense Flask Backend (http://localhost:5000)
                  │
                  ▼
MySQL Database (stocksense) / SQLite in-memory for tests
```

---

## 📋 Prerequisites

Make sure the following are installed on your machine:
1. **Python 3.10+** (Tested with Python 3.12)
2. **Node.js 18+ & npm** (for the React/Vite frontend)
3. **MySQL 8.0+** (Optional: application supports zero-config SQLite for instant local testing)

---

## ⚡ Quick Start (Run Both in 2 Terminals)

### Terminal 1: Run Backend
```bash
# 1. Navigate to backend directory
cd backend

# 2. (Recommended) Activate virtual environment
# Windows:
python -m venv venv
.\venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Initialize database tables
python app.py init-db

# 5. Start the backend server
python app.py
```
> Backend runs at: **`http://localhost:5000`**

---

### Terminal 2: Run Frontend
```bash
# 1. Open a new terminal and navigate to frontend directory
cd frontend

# 2. Install Node dependencies
npm install

# 3. Start the Vite development server
npm run dev
```
> Frontend runs at: **`http://localhost:3000`**

---

## 🔧 Detailed Backend Setup (`/backend`)

### 1. Configure Environment Variables (`.env`)
The backend comes pre-configured with a `.env` file. You can customize settings:

```ini
# Flask Server Settings
FLASK_APP=app.py
FLASK_ENV=development
DEBUG=True
PORT=5000

# Security Keys
SECRET_KEY=stocksense-super-secret-key-development
JWT_SECRET_KEY=stocksense-jwt-secret-key-development
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

> **Zero-Config SQLite Fallback**: If you do not have MySQL running right away, add this line to `backend/.env` to run with a local SQLite file:
> ```ini
> DATABASE_URL=sqlite:///stocksense.db
> ```

### 2. MySQL Database Setup
If using MySQL, create the database:
```sql
CREATE DATABASE stocksense CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then initialize the tables:
```bash
python app.py init-db
# or: flask init-db
```

### 3. Start Backend Server
```bash
python app.py
```

### 4. Verify Backend Health
Test with cURL, PowerShell, or your browser:
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

### 5. Run Automated Backend Tests
The backend includes 27 comprehensive automated tests (including delivery stock rejection, transfer invariance, receipt increments, and AI tests):
```bash
python -m pytest tests/ -v
```

---

## 💻 Detailed Frontend Setup (`/frontend`)

The frontend is built with modern React, Vite, and Tailwind CSS.

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Vite will start the server:
```text
  VITE v5.1.6  ready in 280 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.1.100:3000/
```

### 3. Open in Browser
Visit **[http://localhost:3000](http://localhost:3000)** to view and interact with StockSense!

### 4. Production Build (Optional)
To test or build the optimized production frontend bundle:
```bash
npm run build
npm run preview
```

---

## 🌐 Connecting Frontend to Backend

1. **CORS**: The backend has `Flask-CORS` enabled and permits requests from `http://localhost:3000`.
2. **API Base URL**: The backend serves API endpoints under the `/api` prefix (e.g. `http://localhost:5000/api`).
3. **Authentication**: All protected endpoints accept the header:
   ```http
   Authorization: Bearer <your_jwt_access_token>
   ```

---

## 🛠️ Common Troubleshooting

| Issue | Cause | Solution |
|---|---|---|
| **Port 5000 already in use** | Another service or AirPlay is on port 5000 | Change `PORT=5001` in `backend/.env` or run `$env:PORT="5001"; python app.py` |
| **Port 3000 already in use** | Another Node application is running | Vite will offer the next available port (e.g. 3001) or edit `server.port` in `frontend/vite.config.js` |
| **MySQL Connection Refused** | MySQL service not running | Start MySQL service (`services.msc` on Windows or `brew services start mysql` on Mac), or use SQLite by setting `DATABASE_URL=sqlite:///stocksense.db` in `backend/.env` |
| **CORS Error in Browser Console** | Frontend origin not whitelisted | Ensure `CORS_ORIGINS` in `backend/.env` includes your frontend port (e.g. `http://localhost:3000`) |

---

## 📖 Additional Documentation

- Complete Backend API documentation: **[backend/README.md](file:///c:/Users/Iniya/OneDrive/Desktop/odoo-hackathon/backend/README.md)**
- Detailed cURL and Postman test workflows: **[backend/HOW_TO_RUN.md](file:///c:/Users/Iniya/OneDrive/Desktop/odoo-hackathon/backend/HOW_TO_RUN.md)**
