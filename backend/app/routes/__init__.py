from flask import Blueprint, jsonify
from app.routes.auth_routes import auth_bp
from app.routes.product_routes import product_bp
from app.routes.category_routes import category_bp
from app.routes.warehouse_routes import warehouse_bp
from app.routes.inventory_routes import inventory_bp
from app.routes.receipt_routes import receipt_bp
from app.routes.delivery_routes import delivery_bp
from app.routes.transfer_routes import transfer_bp
from app.routes.adjustment_routes import adjustment_bp
from app.routes.ledger_routes import ledger_bp
from app.routes.notification_routes import notification_bp
from app.routes.dashboard_routes import dashboard_bp
from app.routes.report_routes import report_bp
from app.routes.ai_routes import ai_bp
from app.utils.helpers import api_response

health_bp = Blueprint("health", __name__)

@health_bp.route("/", methods=["GET"])
def root_index():
    return api_response(
        success=True,
        message="StockSense Backend REST API is running",
        data={
            "version": "1.0.0",
            "health_check": "/api/health",
            "endpoints": {
                "auth": "/api/auth",
                "products": "/api/products",
                "inventory": "/api/inventory",
                "warehouses": "/api/warehouses",
                "receipts": "/api/receipts",
                "deliveries": "/api/deliveries",
                "transfers": "/api/transfers",
                "adjustments": "/api/adjustments",
                "dashboard": "/api/dashboard",
                "ai": "/api/ai",
            },
        },
    )

@health_bp.route("/api/health", methods=["GET"])
def health_check():
    return api_response(success=True, message="StockSense API is running")

def register_blueprints(app):
    app.register_blueprint(health_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(product_bp)
    app.register_blueprint(category_bp)
    app.register_blueprint(warehouse_bp)
    app.register_blueprint(inventory_bp)
    app.register_blueprint(receipt_bp)
    app.register_blueprint(delivery_bp)
    app.register_blueprint(transfer_bp)
    app.register_blueprint(adjustment_bp)
    app.register_blueprint(ledger_bp)
    app.register_blueprint(notification_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(report_bp)
    app.register_blueprint(ai_bp)
