from flask import Blueprint, request
from marshmallow import ValidationError
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.delivery_service import DeliveryService, InsufficientStockError
from app.schemas.delivery_schema import DeliveryCreateSchema, DeliveryUpdateSchema
from app.utils.validators import parse_int_or_default
from app.utils.helpers import api_response

delivery_bp = Blueprint("deliveries", __name__, url_prefix="/api/deliveries")
create_schema = DeliveryCreateSchema()
update_schema = DeliveryUpdateSchema()

@delivery_bp.route("", methods=["GET"])
@jwt_required()
def get_deliveries():
    status = request.args.get("status")
    warehouse_id = parse_int_or_default(request.args.get("warehouse_id"))
    page = parse_int_or_default(request.args.get("page"), 1)
    limit = parse_int_or_default(request.args.get("limit"), 20)

    result = DeliveryService.get_all(status=status, warehouse_id=warehouse_id, page=page, limit=limit)
    return api_response(success=True, message="Deliveries retrieved successfully", data=result["items"])

@delivery_bp.route("/<int:delivery_id>", methods=["GET"])
@jwt_required()
def get_delivery(delivery_id: int):
    try:
        delivery = DeliveryService.get_by_id(delivery_id)
        return api_response(success=True, message="Delivery retrieved successfully", data=delivery)
    except ValueError as e:
        return api_response(success=False, message=str(e), status_code=404)

@delivery_bp.route("", methods=["POST"])
@jwt_required()
def create_delivery():
    json_data = request.get_json() or {}
    try:
        data = create_schema.load(json_data)
    except ValidationError as err:
        return api_response(success=False, message="Validation error", errors=err.messages, status_code=422)

    user_id = parse_int_or_default(get_jwt_identity())
    try:
        delivery = DeliveryService.create(data, user_id=user_id)
        return api_response(success=True, message="Delivery order created successfully", data=delivery, status_code=201)
    except ValueError as e:
        return api_response(success=False, message=str(e), status_code=400)

@delivery_bp.route("/<int:delivery_id>", methods=["PUT"])
@jwt_required()
def update_delivery(delivery_id: int):
    json_data = request.get_json() or {}
    try:
        data = update_schema.load(json_data)
    except ValidationError as err:
        return api_response(success=False, message="Validation error", errors=err.messages, status_code=422)

    try:
        updated = DeliveryService.update(delivery_id, data)
        return api_response(success=True, message="Delivery updated successfully", data=updated)
    except ValueError as e:
        return api_response(success=False, message=str(e), status_code=400)

@delivery_bp.route("/<int:delivery_id>", methods=["DELETE"])
@jwt_required()
def delete_delivery(delivery_id: int):
    try:
        DeliveryService.delete(delivery_id)
        return api_response(success=True, message="Delivery deleted successfully")
    except ValueError as e:
        return api_response(success=False, message=str(e), status_code=400)

@delivery_bp.route("/<int:delivery_id>/validate", methods=["POST"])
@jwt_required()
def validate_delivery(delivery_id: int):
    user_id = parse_int_or_default(get_jwt_identity())
    try:
        result = DeliveryService.validate_delivery(delivery_id, user_id=user_id)
        return api_response(success=True, message="Delivery validated and dispatched successfully", data=result)
    except InsufficientStockError as e:
        return api_response(success=False, message="Insufficient stock", errors={"stock": str(e)}, status_code=400)
    except ValueError as e:
        return api_response(success=False, message=str(e), status_code=400)
    except Exception as e:
        return api_response(success=False, message=f"Delivery validation failed: {str(e)}", status_code=500)
