from flask import Blueprint, request
from marshmallow import ValidationError
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.auth_service import AuthService
from app.schemas.user_schema import (
    UserRegisterSchema,
    UserLoginSchema,
    ForgotPasswordSchema,
    VerifyOtpSchema,
    ResetPasswordSchema,
)
from app.utils.helpers import api_response

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

register_schema = UserRegisterSchema()
login_schema = UserLoginSchema()
forgot_pw_schema = ForgotPasswordSchema()
verify_otp_schema = VerifyOtpSchema()
reset_pw_schema = ResetPasswordSchema()

@auth_bp.route("/register", methods=["POST"])
def register():
    json_data = request.get_json() or {}
    try:
        data = register_schema.load(json_data)
    except ValidationError as err:
        return api_response(success=False, message="Validation error", errors=err.messages, status_code=422)

    try:
        user_dict, token = AuthService.register(data)
        return api_response(
            success=True,
            message="User registered successfully",
            data={"user": user_dict, "access_token": token},
            status_code=201,
        )
    except ValueError as e:
        return api_response(success=False, message=str(e), status_code=409)
    except Exception as e:
        return api_response(success=False, message=f"Registration failed: {str(e)}", status_code=500)

@auth_bp.route("/login", methods=["POST"])
def login():
    json_data = request.get_json() or {}
    try:
        data = login_schema.load(json_data)
    except ValidationError as err:
        return api_response(success=False, message="Validation error", errors=err.messages, status_code=422)

    try:
        user_dict, token = AuthService.login(data)
        return api_response(
            success=True,
            message="Login successful",
            data={"user": user_dict, "access_token": token},
            status_code=200,
        )
    except PermissionError as e:
        return api_response(success=False, message=str(e), status_code=403)
    except ValueError as e:
        return api_response(success=False, message=str(e), status_code=401)
    except Exception as e:
        return api_response(success=False, message=f"Login failed: {str(e)}", status_code=500)

@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    json_data = request.get_json() or {}
    try:
        data = forgot_pw_schema.load(json_data)
    except ValidationError as err:
        return api_response(success=False, message="Validation error", errors=err.messages, status_code=422)

    result = AuthService.forgot_password(data["email"])
    return api_response(success=True, message=result["message"], data=result, status_code=200)

@auth_bp.route("/verify-otp", methods=["POST"])
def verify_otp():
    json_data = request.get_json() or {}
    try:
        data = verify_otp_schema.load(json_data)
    except ValidationError as err:
        return api_response(success=False, message="Validation error", errors=err.messages, status_code=422)

    is_valid = AuthService.verify_otp(data["email"], data["otp"])
    if not is_valid:
        return api_response(success=False, message="Invalid or expired OTP", status_code=400)

    return api_response(success=True, message="OTP verified successfully", status_code=200)

@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    json_data = request.get_json() or {}
    try:
        data = reset_pw_schema.load(json_data)
    except ValidationError as err:
        return api_response(success=False, message="Validation error", errors=err.messages, status_code=422)

    try:
        AuthService.reset_password(data["email"], data["otp"], data["new_password"])
        return api_response(success=True, message="Password reset successfully. You can now login.", status_code=200)
    except ValueError as e:
        return api_response(success=False, message=str(e), status_code=400)
    except Exception as e:
        return api_response(success=False, message=f"Password reset failed: {str(e)}", status_code=500)

@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_me():
    user_id = int(get_jwt_identity())
    profile = AuthService.get_profile(user_id)
    if not profile:
        return api_response(success=False, message="User not found", status_code=404)
    return api_response(success=True, message="Profile fetched successfully", data=profile)

@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    # Stateless JWT logout acknowledged by backend
    return api_response(success=True, message="Logged out successfully", status_code=200)
