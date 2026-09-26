from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from app.services.inventory_service import InventoryService
from app.utils.validators import parse_int_or_default
from app.utils.helpers import api_response

inventory_bp = Blueprint("inventory", __name__, url_prefix="/api/inventory")

@inventory_bp.route("", methods=["GET"])
@jwt_required()
def get_inventory():
    search = request.args.get("search")
    category_id = parse_int_or_default(request.args.get("category_id"))
    warehouse_id = parse_int_or_default(request.args.get("warehouse_id"))
    low_stock = request.args.get("low_stock", "").lower() in ["true", "1"]
    out_of_stock = request.args.get("out_of_stock", "").lower() in ["true", "1"]
    page = parse_int_or_default(request.args.get("page"), 1)
    limit = parse_int_or_default(request.args.get("limit"), 20)

    result = InventoryService.get_inventory(
        search=search,
        category_id=category_id,
        warehouse_id=warehouse_id,
        low_stock_only=low_stock,
        out_of_stock_only=out_of_stock,
        page=page,
        limit=limit,
    )
    return api_response(
        success=True,
        message="Inventory fetched successfully",
        data=result["items"],
        status_code=200,
    )

@inventory_bp.route("/product/<int:product_id>", methods=["GET"])
@jwt_required()
def get_product_inventory(product_id: int):
    try:
        data = InventoryService.get_by_product(product_id)
        return api_response(success=True, message="Product stock fetched successfully", data=data)
    except ValueError as e:
        return api_response(success=False, message=str(e), status_code=404)

@inventory_bp.route("/warehouse/<int:warehouse_id>", methods=["GET"])
@jwt_required()
def get_warehouse_inventory(warehouse_id: int):
    try:
        data = InventoryService.get_by_warehouse(warehouse_id)
        return api_response(success=True, message="Warehouse stock fetched successfully", data=data)
    except ValueError as e:
        return api_response(success=False, message=str(e), status_code=404)
