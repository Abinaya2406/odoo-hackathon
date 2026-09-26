from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from app.models.product import Product
from app.models.stock_ledger import StockLedger
from app.models.receipt import Receipt
from app.models.delivery import Delivery
from app.models.adjustment import Adjustment
from app.utils.validators import validate_date, parse_int_or_default
from app.utils.helpers import api_response

report_bp = Blueprint("reports", __name__, url_prefix="/api/reports")

@report_bp.route("/inventory", methods=["GET"])
@jwt_required()
def report_inventory():
    warehouse_id = parse_int_or_default(request.args.get("warehouse_id"))
    products = Product.query.filter_by(is_deleted=False).all()

    report_data = []
    for p in products:
        stocks = p.stocks.all()
        if warehouse_id:
            stocks = [s for s in stocks if s.warehouse_id == warehouse_id]
        total_qty = sum(s.quantity for s in stocks)
        valuation = round(total_qty * p.cost_price, 2)

        report_data.append({
            "product_id": p.id,
            "product_name": p.name,
            "sku": p.sku,
            "category": p.category.name if p.category else "Uncategorized",
            "quantity": total_qty,
            "unit_of_measure": p.unit_of_measure,
            "unit_cost": p.cost_price,
            "valuation": valuation,
            "status": p.stock_status,
        })

    total_val = sum(item["valuation"] for item in report_data)
    total_qty = sum(item["quantity"] for item in report_data)

    return api_response(
        success=True,
        message="Inventory valuation report generated",
        data={
            "summary": {"total_products": len(report_data), "total_quantity": total_qty, "total_valuation": total_val},
            "rows": report_data,
        }
    )

@report_bp.route("/movement", methods=["GET"])
@jwt_required()
def report_movement():
    start_date = validate_date(request.args.get("start_date"))
    end_date = validate_date(request.args.get("end_date"))
    warehouse_id = parse_int_or_default(request.args.get("warehouse_id"))

    query = StockLedger.query
    if start_date:
        query = query.filter(StockLedger.created_at >= start_date)
    if end_date:
        query = query.filter(StockLedger.created_at <= end_date)
    if warehouse_id:
        query = query.filter(StockLedger.warehouse_id == warehouse_id)

    entries = query.order_by(StockLedger.created_at.desc()).all()

    # Aggregate by type
    type_counts = {}
    type_quantities = {}
    for e in entries:
        t = e.transaction_type
        type_counts[t] = type_counts.get(t, 0) + 1
        type_quantities[t] = round(type_quantities.get(t, 0.0) + abs(e.quantity), 2)

    return api_response(
        success=True,
        message="Stock movement report generated",
        data={
            "aggregates": {
                "transaction_counts": type_counts,
                "transaction_volumes": type_quantities,
            },
            "records": [e.to_dict() for e in entries],
        }
    )

@report_bp.route("/receipts", methods=["GET"])
@jwt_required()
def report_receipts():
    start_date = validate_date(request.args.get("start_date"))
    end_date = validate_date(request.args.get("end_date"))
    warehouse_id = parse_int_or_default(request.args.get("warehouse_id"))

    query = Receipt.query
    if start_date:
        query = query.filter(Receipt.receipt_date >= start_date)
    if end_date:
        query = query.filter(Receipt.receipt_date <= end_date)
    if warehouse_id:
        query = query.filter(Receipt.warehouse_id == warehouse_id)

    receipts = query.order_by(Receipt.receipt_date.desc()).all()
    status_summary = {}
    total_items_received = 0

    for r in receipts:
        status_summary[r.status] = status_summary.get(r.status, 0) + 1
        if r.status == "DONE":
            total_items_received += sum(item.quantity for item in r.items)

    return api_response(
        success=True,
        message="Receipts report generated",
        data={
            "summary": {"total_receipts": len(receipts), "status_breakdown": status_summary, "total_units_received": total_items_received},
            "receipts": [r.to_dict() for r in receipts],
        }
    )

@report_bp.route("/deliveries", methods=["GET"])
@jwt_required()
def report_deliveries():
    start_date = validate_date(request.args.get("start_date"))
    end_date = validate_date(request.args.get("end_date"))
    warehouse_id = parse_int_or_default(request.args.get("warehouse_id"))

    query = Delivery.query
    if start_date:
        query = query.filter(Delivery.delivery_date >= start_date)
    if end_date:
        query = query.filter(Delivery.delivery_date <= end_date)
    if warehouse_id:
        query = query.filter(Delivery.warehouse_id == warehouse_id)

    deliveries = query.order_by(Delivery.delivery_date.desc()).all()
    status_summary = {}
    total_units_dispatched = 0

    for d in deliveries:
        status_summary[d.status] = status_summary.get(d.status, 0) + 1
        if d.status == "DONE":
            total_units_dispatched += sum(item.quantity for item in d.items)

    return api_response(
        success=True,
        message="Deliveries report generated",
        data={
            "summary": {"total_deliveries": len(deliveries), "status_breakdown": status_summary, "total_units_dispatched": total_units_dispatched},
            "deliveries": [d.to_dict() for d in deliveries],
        }
    )

@report_bp.route("/adjustments", methods=["GET"])
@jwt_required()
def report_adjustments():
    start_date = validate_date(request.args.get("start_date"))
    end_date = validate_date(request.args.get("end_date"))
    warehouse_id = parse_int_or_default(request.args.get("warehouse_id"))

    query = Adjustment.query
    if start_date:
        query = query.filter(Adjustment.created_at >= start_date)
    if end_date:
        query = query.filter(Adjustment.created_at <= end_date)
    if warehouse_id:
        query = query.filter(Adjustment.warehouse_id == warehouse_id)

    adjustments = query.order_by(Adjustment.created_at.desc()).all()
    net_discrepancy = sum(a.difference for a in adjustments)

    return api_response(
        success=True,
        message="Stock adjustments report generated",
        data={
            "summary": {"total_adjustments": len(adjustments), "net_quantity_discrepancy": round(net_discrepancy, 2)},
            "adjustments": [a.to_dict() for a in adjustments],
        }
    )
