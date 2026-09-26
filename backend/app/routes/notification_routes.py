from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.notification_service import NotificationService
from app.utils.validators import parse_int_or_default
from app.utils.helpers import api_response

notification_bp = Blueprint("notifications", __name__, url_prefix="/api/notifications")

@notification_bp.route("", methods=["GET"])
@jwt_required()
def get_notifications():
    user_id = parse_int_or_default(get_jwt_identity())
    is_read_param = request.args.get("is_read")
    is_read = None
    if is_read_param is not None:
        is_read = is_read_param.lower() in ["true", "1"]

    page = parse_int_or_default(request.args.get("page"), 1)
    limit = parse_int_or_default(request.args.get("limit"), 20)

    result = NotificationService.get_notifications(user_id=user_id, is_read=is_read, page=page, limit=limit)
    return api_response(success=True, message="Notifications fetched successfully", data=result)

@notification_bp.route("/<int:notification_id>/read", methods=["PUT"])
@jwt_required()
def mark_read(notification_id: int):
    try:
        updated = NotificationService.mark_as_read(notification_id)
        return api_response(success=True, message="Notification marked as read", data=updated)
    except ValueError as e:
        return api_response(success=False, message=str(e), status_code=404)

@notification_bp.route("/read-all", methods=["PUT"])
@jwt_required()
def mark_all_read():
    user_id = parse_int_or_default(get_jwt_identity())
    count = NotificationService.mark_all_as_read(user_id)
    return api_response(success=True, message=f"{count} notifications marked as read", data={"updated_count": count})

@notification_bp.route("/<int:notification_id>", methods=["DELETE"])
@jwt_required()
def delete_notification(notification_id: int):
    try:
        NotificationService.delete_notification(notification_id)
        return api_response(success=True, message="Notification deleted successfully")
    except ValueError as e:
        return api_response(success=False, message=str(e), status_code=404)
