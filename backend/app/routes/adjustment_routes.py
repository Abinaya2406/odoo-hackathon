from flask import Blueprint, request
from marshmallow import ValidationError
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.adjustment_service import AdjustmentService
from app.schemas.adjustment_schema import AdjustmentCreateSchema
from app.utils.validators import parse_int_or_default
from app.utils.helpers import api_response

adjustment_bp = Blueprint("adjustments", __name__, url_prefix="/api/adjustments")
create_schema = AdjustmentCreateSchema()

@adjustment_bp.route("", methods=["GET"])
@jwt_required()
def get_adjustments():
    product_id = parse_int_or_default(request.args.get("product_id"))
    warehouse_id = parse_int_or_default(request.args.get("warehouse_id"))
    page = parse_int_or_default(request.args.get("page"), 1)
    limit = parse_int_or_default(request.args.get("limit"), 20)

    result = AdjustmentService.get_all(product_id=product_id, warehouse_id=warehouse_id, page=page, limit=limit)
    return api_response(success=True, message="Adjustments retrieved successfully", data=result["items"])

@adjustment_bp.route("/<int:adjustment_id>", methods=["GET"])
@jwt_required()
def get_adjustment(adjustment_id: int):
    try:
        adj = AdjustmentService.get_by_id(adjustment_id)
        return api_response(success=True, message="Adjustment retrieved successfully", data=adj)
    except ValueError as e:
        return api_response(success=False, message=str(e), status_code=404)

@adjustment_bp.route("", methods=["POST"])
@jwt_required()
def create_adjustment():
    json_data = request.get_json() or {}
    try:
        data = create_schema.load(json_data)
    except ValidationError as err:
        return api_response(success=False, message="Validation error", errors=err.messages, status_code=422)

    user_id = parse_int_or_default(get_jwt_identity())
    try:
        adjustment = AdjustmentService.create(data, user_id=user_id)
        return api_response(success=True, message="Stock adjusted successfully", data=adjustment, status_code=201)
    except ValueError as e:
        return api_response(success=False, message=str(e), status_code=400)
    except Exception as e:
        return api_response(success=False, message=f"Adjustment failed: {str(e)}", status_code=500)
