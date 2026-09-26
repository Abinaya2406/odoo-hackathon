from datetime import datetime, timedelta
from app.extensions import db
from app.models.user import User
from app.utils.auth import create_user_token, generate_otp

class AuthService:
    @staticmethod
    def register(data: dict) -> tuple[dict, str]:
        email = data.get("email", "").strip().lower()
        if User.query.filter_by(email=email).first():
            raise ValueError("A user with this email already exists.")

        user = User(
            name=data.get("name", "").strip(),
            email=email,
            phone=data.get("phone"),
            role=data.get("role", "WAREHOUSE_STAFF"),
            is_active=True,
        )
        user.set_password(data.get("password") or "")

        db.session.add(user)
        db.session.commit()

        token = create_user_token(user)
        return user.to_dict(), token

    @staticmethod
    def login(data: dict) -> tuple[dict, str]:
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            raise ValueError("Invalid email or password.")

        if not user.is_active:
            raise PermissionError("User account is deactivated.")

        token = create_user_token(user)
        return user.to_dict(), token

    @staticmethod
    def forgot_password(email: str) -> dict:
        email = email.strip().lower()
        user = User.query.filter_by(email=email).first()
        if not user:
            # For security, avoid leaking user existence, but inform client request was processed
            return {"message": "If this email is registered, an OTP has been sent."}

        otp = generate_otp(6)
        user.reset_otp = otp
        user.reset_otp_expiry = datetime.utcnow() + timedelta(minutes=15)
        db.session.commit()

        # In production this would send via email/SMS; for API/testing we return it in response metadata
        return {
            "message": "Password reset OTP generated successfully.",
            "otp_preview": otp,  # Handy for local testing / frontend integration
        }

    @staticmethod
    def verify_otp(email: str, otp: str) -> bool:
        email = email.strip().lower()
        user = User.query.filter_by(email=email).first()
        if not user or not user.reset_otp or user.reset_otp != otp:
            return False

        if datetime.utcnow() > user.reset_otp_expiry:
            return False

        return True

    @staticmethod
    def reset_password(email: str, otp: str, new_password: str) -> bool:
        email = email.strip().lower()
        user = User.query.filter_by(email=email).first()
        if not user or not user.reset_otp or user.reset_otp != otp:
            raise ValueError("Invalid OTP or email.")

        if datetime.utcnow() > user.reset_otp_expiry:
            raise ValueError("OTP has expired. Please request a new one.")

        user.set_password(new_password)
        user.reset_otp = None
        user.reset_otp_expiry = None
        db.session.commit()
        return True

    @staticmethod
    def get_profile(user_id: int) -> dict | None:
        user = User.query.get(user_id)
        return user.to_dict() if user else None
