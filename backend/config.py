import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Base configuration."""
    SECRET_KEY = os.getenv("SECRET_KEY", "stocksense-default-secret-key-2026")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "stocksense-jwt-secret-key-2026")
    
    # Expiration: default to 1 day (1440 minutes)
    jwt_minutes = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_MINUTES", "1440"))
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=jwt_minutes)

    # Database configuration
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "3306")
    DB_NAME = os.getenv("DB_NAME", "stocksense")
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    
    # If DATABASE_URL is explicitly set (e.g. for Heroku/Render/Docker/SQLite), use it
    # Otherwise build MySQL connection string
    db_url = os.getenv("DATABASE_URL")
    if db_url:
        SQLALCHEMY_DATABASE_URI = db_url
    else:
        # Default MySQL with PyMySQL driver
        SQLALCHEMY_DATABASE_URI = (
            f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
        )
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_recycle": 280,
        "pool_pre_ping": True,
    }

    # CORS configuration
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    ENV = "development"

class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    DEBUG = True
    # In-memory SQLite for fast, isolated, reliable tests
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SQLALCHEMY_ENGINE_OPTIONS = {}
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=60)

class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    ENV = "production"

config_by_name = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig,
}
