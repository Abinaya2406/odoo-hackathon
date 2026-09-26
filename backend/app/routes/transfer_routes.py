from flask import Blueprint, request
from marshmallow import ValidationError
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.transfer_service import TransferService
from app.schemas.transfer_schema import TransferCreateSchema, TransferUpdateSchema
from app.utils.validators import parse_int_or_default
from app.utils.helpers import api_response

transfer_bp = Blueprint("transfers", __name__, url_prefix="/api/transfers")
create_schema = TransferCreateSchema()
update_schema = TransferUpdateSchema()

@transfer_bp.route("", methods=["GET"])
@jwt_required()
def get_transfers():
    status = request.args.get("status")
    page = parse_int_or_default(request.args.get("page"), 1)
    limit = parse_int_or_default(request.args.get("limit"), 20)

    result = TransferService.get_all(status=status, page=page, limit=limit)
    return api_response(success=True, message="Transfers retrieved successfully", data=result["items"])

@transfer_bp.route("/<int:transfer_id>", methods=["GET"])
@jwt_required()
def get_transfer(transfer_id: int):
    try:
        transfer = TransferService.get_by_id(transfer_id)
        return api_response(success=True, message="Transfer retrieved successfully", data=transfer)
    except ValueError as e:
        return api_response(success=False, message=str(e), status_code=404)

@transfer_bp.route("", methods=["POST"])
@jwt_required()
def create_transfer():
    json_data = request.get_json() or {}
    try:
        data = create_schema.load(json_data)
    except ValidationError as err:
        return api_response(success=False, message="Validation error", errors=err.messages, status_code=422)

    user_id = parse_int_or_default(get_jwt_identity())
    try:
        transfer = TransferService.create(data, user_id=user_id)
        return api_response(success=True, message="Transfer initiated successfully", data=transfer, status_code=201)
    except ValueError as e:
        return api_response(success=False, message=str(e), status_code=400)

@transfer_bp.route("/<int:transfer_id>", methods=["PUT"])
@jwt_required()
def update_transfer(transfer_id: int):
    json_data = request.get_json() or {}
    try:
        data = update_schema.load(json_data)
    except ValidationError as err:
        return api_response(success=False, message="Validation error", errors=err.messages, status_code=422)

    try:
        updated = TransferService.update(transfer_id, data)
        return api_response(success=True, message="Transfer updated successfully", data=updated)
    except ValueError as e:
        return api_response(success=False, message=str(e), status_code=400)

@transfer_bp.route("/<int:transfer_id>/validate", methods=["POST"])
@jwt_required()
def validate_transfer(transfer_id: int):
    user_id = parse_int_or_default(get_jwt_identity())
    try:
        result = TransferService.validate_transfer(transfer_id, user_id=user_id)
        return api_response(success=True, message="Transfer validated and stock relocated successfully", data=result)
    except ValueError as e:
        return api_response(success=False, message=str(e), status_code=400)
    except Exception as e:
        return api_response(success=False, message=f"Transfer validation failed: {str(e)}", status_code=500)
