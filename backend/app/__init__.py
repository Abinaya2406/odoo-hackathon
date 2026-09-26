import os
from flask import Flask, jsonify
from marshmallow import ValidationError
from sqlalchemy.exc import SQLAlchemyError
from app.extensions import db, jwt, migrate, cors
try:
    from config import config_by_name
except ImportError:
    from app.config import config_by_name
from app.routes import register_blueprints
from app.utils.helpers import api_response

def create_app(config_name: str | None = None) -> Flask:
    if config_name is None:
        config_name = os.getenv("FLASK_ENV", "development")

    app = Flask(__name__)
    app.config.from_object(config_by_name.get(config_name, config_by_name["default"]))

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app, resources={r"/api/*": {"origins": app.config.get("CORS_ORIGINS", "*")}})

    # Register all Blueprints
    register_blueprints(app)

    # Register Global Error Handlers
    register_error_handlers(app)

    # Register JWT Error Handlers
    register_jwt_handlers(app)

    # Register CLI Commands
    @app.cli.command("init-db")
    def init_db_command():
        """Initialize all database tables."""
        import app.models  # Ensure all models are registered with SQLAlchemy metadata
        db.create_all()
        print("Database tables initialized successfully!")

    return app

def register_error_handlers(app: Flask):
    @app.errorhandler(400)
    def handle_bad_request(e):
        return api_response(success=False, message="Bad request", status_code=400)

    @app.errorhandler(401)
    def handle_unauthorized(e):
        return api_response(success=False, message="Unauthorized", status_code=401)

    @app.errorhandler(403)
    def handle_forbidden(e):
        return api_response(success=False, message="Forbidden: insufficient permissions", status_code=403)

    @app.errorhandler(404)
    def handle_not_found(e):
        return api_response(success=False, message="Resource not found", status_code=404)

    @app.errorhandler(405)
    def handle_method_not_allowed(e):
        return api_response(success=False, message="Method not allowed", status_code=405)

    @app.errorhandler(422)
    def handle_unprocessable_entity(e):
        return api_response(success=False, message="Unprocessable entity", status_code=422)

    @app.errorhandler(500)
    def handle_server_error(e):
        return api_response(success=False, message="Internal server error", status_code=500)

    @app.errorhandler(ValidationError)
    def handle_validation_error(e):
        return api_response(success=False, message="Validation error", errors=e.messages, status_code=422)

    @app.errorhandler(SQLAlchemyError)
    def handle_db_error(e):
        db.session.rollback()
        return api_response(success=False, message=f"Database transaction error: {str(e)}", status_code=500)

def register_jwt_handlers(app: Flask):
    @jwt.expired_token_loader
    def handle_expired_token(jwt_header, jwt_payload):
        return api_response(success=False, message="Token has expired. Please login again.", status_code=401)

    @jwt.invalid_token_loader
    def handle_invalid_token(reason):
        return api_response(success=False, message=f"Invalid authentication token: {reason}", status_code=401)

    @jwt.unauthorized_loader
    def handle_missing_token(reason):
        return api_response(success=False, message=f"Missing Authorization header: {reason}", status_code=401)
