from datetime import datetime, timedelta
import random
import string
from flask_jwt_extended import create_access_token, get_jwt_identity
from app.models.user import User

def create_user_token(user: User) -> str:
    """Generate JWT access token containing user identity and role."""
    # Identity is user id (as string for Flask-JWT-Extended)
    additional_claims = {
        "user_id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
    }
    return create_access_token(identity=str(user.id), additional_claims=additional_claims)

def get_current_user() -> User | None:
    """Retrieve current logged-in user instance from JWT identity."""
    try:
        identity = get_jwt_identity()
        if not identity:
            return None
        return User.query.get(int(identity))
    except Exception:
        return None

def generate_otp(length: int = 6) -> str:
    """Generate a 6-digit numeric OTP."""
    return "".join(random.choices(string.digits, k=length))
