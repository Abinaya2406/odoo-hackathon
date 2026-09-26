from flask import Blueprint, request
from marshmallow import ValidationError
from flask_jwt_extended import jwt_required
from app.services.product_service import ProductService
from app.schemas.product_schema import ProductCreateSchema, ProductUpdateSchema
from app.utils.decorators import role_required
from app.utils.validators import parse_int_or_default
from app.utils.helpers import api_response

product_bp = Blueprint("products", __name__, url_prefix="/api/products")
create_schema = ProductCreateSchema()
update_schema = ProductUpdateSchema()

@product_bp.route("", methods=["GET"])
@jwt_required(optional=True)
def get_products():
    search = request.args.get("search")
    category_id = parse_int_or_default(request.args.get("category_id"))
    warehouse_id = parse_int_or_default(request.args.get("warehouse_id"))
    stock_status = request.args.get("stock_status")
    sort_by = request.args.get("sort_by", "id")
    order = request.args.get("order", "asc")
    page = parse_int_or_default(request.args.get("page"), 1)
    limit = parse_int_or_default(request.args.get("limit"), 20)

    result = ProductService.get_all(
        search=search,
        category_id=category_id,
        warehouse_id=warehouse_id,
        stock_status=stock_status,
        sort_by=sort_by,
        order=order,
        page=page,
        limit=limit,
    )
    return api_response(
        success=True,
        message="Products retrieved successfully",
        data=result["items"],
        status_code=200,
    )

@product_bp.route("/scan/<path:code>", methods=["GET"])
@jwt_required(optional=True)
def scan_product(code: str):
    from app.services.ai_intelligence_service import AIIntelligenceService
    try:
        data = AIIntelligenceService.scan_product(code)
        return api_response(success=True, message="Product scanned successfully", data=data)
    except ValueError as e:
        return api_response(success=False, message=str(e), status_code=404)
    except Exception as e:
        return api_response(success=False, message=f"Scan lookup error: {str(e)}", status_code=500)

@product_bp.route("/<int:product_id>", methods=["GET"])
@jwt_required(optional=True)
def get_product(product_id: int):
    try:
        product = ProductService.get_by_id(product_id)
        return api_response(success=True, message="Product retrieved successfully", data=product)
    except ValueError as e:
        return api_response(success=False, message=str(e), status_code=404)

@product_bp.route("", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "INVENTORY_MANAGER"])
def create_product():
    json_data = request.get_json() or {}
    try:
        data = create_schema.load(json_data)
    except ValidationError as err:
        return api_response(success=False, message="Validation error", errors=err.messages, status_code=422)

    try:
        product = ProductService.create(data)
        return api_response(success=True, message="Product created successfully", data=product, status_code=201)
    except ValueError as e:
        return api_response(success=False, message=str(e), status_code=409)

@product_bp.route("/<int:product_id>", methods=["PUT"])
@jwt_required()
@role_required(["ADMIN", "INVENTORY_MANAGER"])
def update_product(product_id: int):
    json_data = request.get_json() or {}
    try:
        data = update_schema.load(json_data)
    except ValidationError as err:
        return api_response(success=False, message="Validation error", errors=err.messages, status_code=422)

    try:
        updated = ProductService.update(product_id, data)
        return api_response(success=True, message="Product updated successfully", data=updated)
    except ValueError as e:
        return api_response(success=False, message=str(e), status_code=400)

@product_bp.route("/<int:product_id>", methods=["DELETE"])
@jwt_required()
@role_required(["ADMIN"])
def delete_product(product_id: int):
    try:
        ProductService.delete(product_id)
        return api_response(success=True, message="Product deleted successfully")
    except ValueError as e:
        return api_response(success=False, message=str(e), status_code=404)
