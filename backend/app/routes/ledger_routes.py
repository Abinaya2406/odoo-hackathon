from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from app.services.ledger_service import LedgerService
from app.utils.validators import parse_int_or_default
from app.utils.helpers import api_response

ledger_bp = Blueprint("ledger", __name__, url_prefix="/api/ledger")

@ledger_bp.route("", methods=["GET"])
@jwt_required()
def get_ledger():
    product_id = parse_int_or_default(request.args.get("product_id"))
    warehouse_id = parse_int_or_default(request.args.get("warehouse_id"))
    location_id = parse_int_or_default(request.args.get("location_id"))
    transaction_type = request.args.get("transaction_type")
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    page = parse_int_or_default(request.args.get("page"), 1)
    limit = parse_int_or_default(request.args.get("limit"), 20)

    result = LedgerService.get_ledger(
        product_id=product_id,
        warehouse_id=warehouse_id,
        location_id=location_id,
        transaction_type=transaction_type,
        start_date=start_date,
        end_date=end_date,
        page=page,
        limit=limit,
    )
    return api_response(success=True, message="Ledger retrieved successfully", data=result["items"])

@ledger_bp.route("/product/<int:product_id>", methods=["GET"])
@jwt_required()
def get_product_ledger(product_id: int):
    history = LedgerService.get_product_history(product_id)
    return api_response(success=True, message="Product stock history retrieved successfully", data=history)
