from flask import Blueprint, request
from marshmallow import ValidationError
from flask_jwt_extended import jwt_required
from app.services.product_service import ProductService
from app.schemas.product_schema import CategorySchema
from app.utils.decorators import role_required
from app.utils.helpers import api_response

category_bp = Blueprint("categories", __name__, url_prefix="/api/categories")
category_schema = CategorySchema()

@category_bp.route("", methods=["GET"])
@jwt_required()
def get_categories():
    categories = ProductService.get_categories()
    return api_response(success=True, message="Categories retrieved successfully", data=categories)

@category_bp.route("", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "INVENTORY_MANAGER"])
def create_category():
    json_data = request.get_json() or {}
    try:
        data = category_schema.load(json_data)
    except ValidationError as err:
        return api_response(success=False, message="Validation error", errors=err.messages, status_code=422)

    try:
        new_cat = ProductService.create_category(data)
        return api_response(success=True, message="Category created successfully", data=new_cat, status_code=201)
    except ValueError as e:
        return api_response(success=False, message=str(e), status_code=409)

@category_bp.route("/<int:category_id>", methods=["PUT"])
@jwt_required()
@role_required(["ADMIN", "INVENTORY_MANAGER"])
def update_category(category_id: int):
    json_data = request.get_json() or {}
    try:
        updated_cat = ProductService.update_category(category_id, json_data)
        return api_response(success=True, message="Category updated successfully", data=updated_cat)
    except ValueError as e:
        return api_response(success=False, message=str(e), status_code=400)

@category_bp.route("/<int:category_id>", methods=["DELETE"])
@jwt_required()
@role_required(["ADMIN"])
def delete_category(category_id: int):
    try:
        ProductService.delete_category(category_id)
        return api_response(success=True, message="Category deleted successfully")
    except ValueError as e:
        return api_response(success=False, message=str(e), status_code=400)
