from marshmallow import Schema, fields, validate, ValidationError

class UserRegisterSchema(Schema):
    name = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=6, max=128))
    phone = fields.Str(allow_none=True, validate=validate.Length(max=30))
    role = fields.Str(
        load_default="WAREHOUSE_STAFF",
        validate=validate.OneOf(["ADMIN", "INVENTORY_MANAGER", "WAREHOUSE_STAFF"])
    )

class UserLoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True)

class ForgotPasswordSchema(Schema):
    email = fields.Email(required=True)

class VerifyOtpSchema(Schema):
    email = fields.Email(required=True)
    otp = fields.Str(required=True, validate=validate.Length(equal=6))

class ResetPasswordSchema(Schema):
    email = fields.Email(required=True)
    otp = fields.Str(required=True, validate=validate.Length(equal=6))
    new_password = fields.Str(required=True, validate=validate.Length(min=6, max=128))

class UserResponseSchema(Schema):
    id = fields.Int()
    name = fields.Str()
    email = fields.Email()
    phone = fields.Str()
    role = fields.Str()
    is_active = fields.Bool()
    created_at = fields.Str()
    updated_at = fields.Str()
