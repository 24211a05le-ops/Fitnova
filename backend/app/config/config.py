import os
from datetime import timedelta
from dotenv import load_dotenv

# Load variables from .env file
load_dotenv()

class Config:
    """Base Configuration Class"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'fitnova_default_super_secret_key')
    
    # Database Configuration (PostgreSQL Neon)
    # Strictly fetch from the environment, no SQLite fallbacks in production.
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    if SQLALCHEMY_DATABASE_URI and SQLALCHEMY_DATABASE_URI.startswith("postgres://"):
        # Support newer SQLAlchemy versions that require postgresql:// scheme
        SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI.replace("postgres://", "postgresql://", 1)
        
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT Configurations
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'fitnova_default_jwt_secret_key')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24) # Production-grade 24 hours session limit
    JWT_HEADER_NAME = "Authorization"
    JWT_HEADER_TYPE = "Bearer"

class DevelopmentConfig(Config):
    """Development Environment Configuration"""
    DEBUG = True
    ENV = 'development'

class ProductionConfig(Config):
    """Production Environment Configuration"""
    DEBUG = False
    ENV = 'production'
    # Enforce strict secret key checks in production
    SECRET_KEY = os.getenv('SECRET_KEY')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')

# Map environments
config_by_name = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
