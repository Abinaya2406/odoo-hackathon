from functools import wraps
from flask_jwt_extended import verify_jwt_in_request, get_jwt
from app.utils.auth import get_current_user
from app.utils.helpers import api_response

def role_required(allowed_roles: list[str]):
    """
    Decorator to restrict access to specific user roles.
    Example: @role_required(['ADMIN', 'INVENTORY_MANAGER'])
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            user_role = claims.get("role")

            user = get_current_user()
            if not user or not user.is_active:
                return api_response(
                    success=False,
                    message="User account is inactive or not found",
                    status_code=403
                )

            if user_role not in allowed_roles:
                return api_response(
                    success=False,
                    message=f"Access forbidden: requires one of roles [{', '.join(allowed_roles)}]",
                    status_code=403
                )
            return fn(*args, **kwargs)
        return wrapper
    return decorator
