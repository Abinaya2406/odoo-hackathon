from flask import Blueprint, request
from marshmallow import ValidationError
from flask_jwt_extended import jwt_required
from app.services.warehouse_service import WarehouseService
from app.schemas.product_schema import WarehouseSchema, LocationSchema, SupplierSchema
from app.utils.decorators import role_required
from app.utils.validators import parse_int_or_default
from app.utils.helpers import api_response

warehouse_bp = Blueprint("warehouses", __name__, url_prefix="/api/warehouses")
warehouse_schema = WarehouseSchema()
location_schema = LocationSchema()
supplier_schema = SupplierSchema()

@warehouse_bp.route("", methods=["GET"])
@jwt_required()
def get_warehouses():
    page = parse_int_or_default(request.args.get("page"), 1)
    limit = parse_int_or_default(request.args.get("limit"), 20)
    result = WarehouseService.get_all(page=page, limit=limit)
    return api_response(success=True, message="Warehouses retrieved successfully", data=result["items"])

@warehouse_bp.route("/<int:warehouse_id>", methods=["GET"])
@jwt_required()
def get_warehouse(warehouse_id: int):
    try:
        warehouse = WarehouseService.get_by_id(warehouse_id)
        return api_response(success=True, message="Warehouse retrieved successfully", data=warehouse)
    except ValueError as e:
        return api_response(success=False, message=str(e), status_code=404)

@warehouse_bp.route("", methods=["POST"])
@jwt_required()
@role_required(["ADMIN"])
def create_warehouse():
    json_data = request.get_json() or {}
    try:
        data = warehouse_schema.load(json_data)
    except ValidationError as err:
        return api_response(success=False, message="Validation error", errors=err.messages, status_code=422)

    warehouse = WarehouseService.create(data)
    return api_response(success=True, message="Warehouse created successfully", data=warehouse, status_code=201)

@warehouse_bp.route("/<int:warehouse_id>", methods=["PUT"])
@jwt_required()
@role_required(["ADMIN"])
def update_warehouse(warehouse_id: int):
    json_data = request.get_json() or {}
    try:
        updated = WarehouseService.update(warehouse_id, json_data)
        return api_response(success=True, message="Warehouse updated successfully", data=updated)
    except ValueError as e:
        return api_response(success=False, message=str(e), status_code=400)

@warehouse_bp.route("/<int:warehouse_id>", methods=["DELETE"])
@jwt_required()
@role_required(["ADMIN"])
def delete_warehouse(warehouse_id: int):
    try:
        WarehouseService.delete(warehouse_id)
        return api_response(success=True, message="Warehouse deleted successfully")
    except ValueError as e:
        return api_response(success=False, message=str(e), status_code=400)

# --- Locations in Warehouse ---
@warehouse_bp.route("/<int:warehouse_id>/locations", methods=["GET"])
@jwt_required()
def get_locations(warehouse_id: int):
    try:
        locations = WarehouseService.get_locations(warehouse_id)
        return api_response(success=True, message="Locations retrieved successfully", data=locations)
    except ValueError as e:
        return api_response(success=False, message=str(e), status_code=404)

@warehouse_bp.route("/<int:warehouse_id>/locations", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "INVENTORY_MANAGER"])
def create_location(warehouse_id: int):
    json_data = request.get_json() or {}
    try:
        data = location_schema.load(json_data)
    except ValidationError as err:
        return api_response(success=False, message="Validation error", errors=err.messages, status_code=422)

    try:
        loc = WarehouseService.create_location(warehouse_id, data)
        return api_response(success=True, message="Location created successfully", data=loc, status_code=201)
    except ValueError as e:
        return api_response(success=False, message=str(e), status_code=400)

# --- Suppliers ---
@warehouse_bp.route("/suppliers", methods=["GET"])
@jwt_required()
def get_suppliers():
    suppliers = WarehouseService.get_suppliers()
    return api_response(success=True, message="Suppliers retrieved successfully", data=suppliers)

@warehouse_bp.route("/suppliers", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "INVENTORY_MANAGER"])
def create_supplier():
    json_data = request.get_json() or {}
    try:
        data = supplier_schema.load(json_data)
    except ValidationError as err:
        return api_response(success=False, message="Validation error", errors=err.messages, status_code=422)

    supplier = WarehouseService.create_supplier(data)
    return api_response(success=True, message="Supplier created successfully", data=supplier, status_code=201)
