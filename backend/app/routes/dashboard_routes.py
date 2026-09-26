from flask import Blueprint
from flask_jwt_extended import jwt_required
from app.models.product import Product
from app.models.warehouse import Warehouse
from app.models.category import Category
from app.models.stock import Stock
from app.models.receipt import Receipt
from app.models.delivery import Delivery
from app.models.transfer import Transfer
from app.models.stock_ledger import StockLedger
from app.utils.helpers import api_response

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")

@dashboard_bp.route("", methods=["GET"])
@jwt_required()
def get_dashboard_summary():
    # 1. Product & Stock Overview
    products = Product.query.filter_by(is_deleted=False).all()
    total_products = len(products)

    total_stock = 0.0
    inventory_value = 0.0
    low_stock_count = 0
    out_of_stock_count = 0

    category_stock_map = {}
    for p in products:
        p_stock = p.total_stock
        total_stock += p_stock
        inventory_value += (p_stock * p.cost_price)

        if p_stock <= 0:
            out_of_stock_count += 1
        elif p_stock <= p.minimum_stock:
            low_stock_count += 1

        cat_name = p.category.name if p.category else "Uncategorized"
        category_stock_map[cat_name] = category_stock_map.get(cat_name, 0.0) + p_stock

    category_wise_stock = [
        {"category": cat, "stock": round(qty, 2)}
        for cat, qty in category_stock_map.items()
    ]

    # 2. Warehouse breakdown
    warehouses = Warehouse.query.all()
    warehouse_wise_stock = []
    for wh in warehouses:
        wh_stock_total = sum(s.quantity for s in wh.stocks.all())
        warehouse_wise_stock.append({
            "warehouse_id": wh.id,
            "warehouse_name": wh.name,
            "location": wh.location,
            "capacity": wh.capacity,
            "current_stock": round(wh_stock_total, 2),
            "utilization_pct": round((wh_stock_total / wh.capacity * 100), 1) if wh.capacity > 0 else 0,
        })

    # 3. Pending Operations
    pending_receipts = Receipt.query.filter(Receipt.status.in_(["DRAFT", "WAITING", "READY"])).count()
    pending_deliveries = Delivery.query.filter(Delivery.status.in_(["DRAFT", "WAITING", "READY"])).count()
    pending_transfers = Transfer.query.filter(Transfer.status.in_(["DRAFT", "READY"])).count()

    # 4. Recent Transactions (last 10)
    recent_entries = (
        StockLedger.query.order_by(StockLedger.created_at.desc(), StockLedger.id.desc())
        .limit(10)
        .all()
    )
    recent_transactions = [e.to_dict() for e in recent_entries]

    # 5. Stock Movement Statistics
    all_ledger = StockLedger.query.all()
    movement_stats = {
        "total_receipt_volume": sum(e.quantity for e in all_ledger if e.transaction_type == "RECEIPT"),
        "total_delivery_volume": sum(abs(e.quantity) for e in all_ledger if e.transaction_type == "DELIVERY"),
        "total_adjustments": sum(1 for e in all_ledger if e.transaction_type == "ADJUSTMENT"),
        "total_transfers": sum(1 for e in all_ledger if e.transaction_type == "TRANSFER_IN"),
    }

    dashboard_data = {
        "total_products": total_products,
        "total_stock": round(total_stock, 2),
        "low_stock_count": low_stock_count,
        "out_of_stock_count": out_of_stock_count,
        "pending_receipts": pending_receipts,
        "pending_deliveries": pending_deliveries,
        "pending_transfers": pending_transfers,
        "inventory_value": round(inventory_value, 2),
        "recent_transactions": recent_transactions,
        "stock_movement_statistics": movement_stats,
        "category_wise_stock": category_wise_stock,
        "warehouse_wise_stock": warehouse_wise_stock,
    }

    return api_response(
        success=True,
        message="Dashboard metrics retrieved successfully",
        data=dashboard_data,
        status_code=200,
    )
