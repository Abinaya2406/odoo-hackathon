from flask import Blueprint, request
from marshmallow import ValidationError
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.receipt_service import ReceiptService
from app.schemas.receipt_schema import ReceiptCreateSchema, ReceiptUpdateSchema
from app.utils.validators import parse_int_or_default
from app.utils.helpers import api_response

receipt_bp = Blueprint("receipts", __name__, url_prefix="/api/receipts")
create_schema = ReceiptCreateSchema()
update_schema = ReceiptUpdateSchema()

@receipt_bp.route("", methods=["GET"])
@jwt_required()
def get_receipts():
    status = request.args.get("status")
    warehouse_id = parse_int_or_default(request.args.get("warehouse_id"))
    page = parse_int_or_default(request.args.get("page"), 1)
    limit = parse_int_or_default(request.args.get("limit"), 20)

    result = ReceiptService.get_all(status=status, warehouse_id=warehouse_id, page=page, limit=limit)
    return api_response(success=True, message="Receipts retrieved successfully", data=result["items"])

@receipt_bp.route("/<int:receipt_id>", methods=["GET"])
@jwt_required()
def get_receipt(receipt_id: int):
    try:
        receipt = ReceiptService.get_by_id(receipt_id)
        return api_response(success=True, message="Receipt retrieved successfully", data=receipt)
    except ValueError as e:
        return api_response(success=False, message=str(e), status_code=404)

@receipt_bp.route("", methods=["POST"])
@jwt_required()
def create_receipt():
    json_data = request.get_json() or {}
    try:
        data = create_schema.load(json_data)
    except ValidationError as err:
        return api_response(success=False, message="Validation error", errors=err.messages, status_code=422)

    user_id = parse_int_or_default(get_jwt_identity())
    try:
        receipt = ReceiptService.create(data, user_id=user_id)
        return api_response(success=True, message="Receipt created successfully", data=receipt, status_code=201)
    except ValueError as e:
        return api_response(success=False, message=str(e), status_code=400)

@receipt_bp.route("/<int:receipt_id>", methods=["PUT"])
@jwt_required()
def update_receipt(receipt_id: int):
    json_data = request.get_json() or {}
    try:
        data = update_schema.load(json_data)
    except ValidationError as err:
        return api_response(success=False, message="Validation error", errors=err.messages, status_code=422)

    try:
        updated = ReceiptService.update(receipt_id, data)
        return api_response(success=True, message="Receipt updated successfully", data=updated)
    except ValueError as e:
        return api_response(success=False, message=str(e), status_code=400)

@receipt_bp.route("/<int:receipt_id>", methods=["DELETE"])
@jwt_required()
def delete_receipt(receipt_id: int):
    try:
        ReceiptService.delete(receipt_id)
        return api_response(success=True, message="Receipt deleted successfully")
    except ValueError as e:
        return api_response(success=False, message=str(e), status_code=400)

@receipt_bp.route("/<int:receipt_id>/validate", methods=["POST"])
@jwt_required()
def validate_receipt(receipt_id: int):
    user_id = parse_int_or_default(get_jwt_identity())
    try:
        result = ReceiptService.validate_receipt(receipt_id, user_id=user_id)
        return api_response(success=True, message="Receipt validated successfully and stock updated", data=result)
    except ValueError as e:
        return api_response(success=False, message=str(e), status_code=400)
    except Exception as e:
        return api_response(success=False, message=f"Receipt validation failed: {str(e)}", status_code=500)
