import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from sqlalchemy import MetaData

# Explicit naming conventions to support SQLite migrations constraint alteration
naming_convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s"
}

# 1. Initialize Extensions globally
db = SQLAlchemy(metadata=MetaData(naming_convention=naming_convention))
jwt = JWTManager()
migrate = Migrate(render_as_batch=True)

def create_app(config_name=None):
    """
    Application Factory Pattern.
    Creates and configures the Flask application.
    """
    # Use 'flask_app' to avoid local scope collision with the 'app' module imports
    flask_app = Flask(__name__)

    # Load configuration
    from app.config.config import config_by_name
    env_name = config_name or os.getenv('FLASK_ENV', 'development')
    flask_app.config.from_object(config_by_name[env_name])

    # [Diagnostics] Print startup parameters
    print(f"\n[Fitnova Diagnostics] Booting in '{env_name}' mode")
    print(f"[Neon DB] Active Database URI: {flask_app.config.get('SQLALCHEMY_DATABASE_URI')}")

    # 2. Configure CORS - explicitly list allowed origins when supports_credentials is True
    allowed_origins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://fitnova-fitness.vercel.app"
    ]
    CORS(flask_app, resources={r"/api/*": {"origins": allowed_origins}}, supports_credentials=True)

    # 3. Initialize Extensions on app
    db.init_app(flask_app)
    jwt.init_app(flask_app)
    migrate.init_app(flask_app, db)

    # 4. Standardize JWT Error responses to match required JSON structure
    from app.utils.responses import error_response, api_response

    @flask_app.route('/')
    def index():
        """Friendly API Root Welcome & Health Check"""
        return api_response(
            success=True,
            message="Welcome to the Gym Progress Intelligence System (Fitnova) REST API Engine!",
            data={
                "status": "healthy",
                "version": "1.0.0",
                "environment": os.getenv('FLASK_ENV', 'development')
            }
        )

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return error_response("Your session token has expired. Please sign in again.", status_code=401)

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return error_response("Provided token is malformed or invalid.", status_code=401)

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return error_response("Authentication credential token is missing.", status_code=401)

    # 5. Register Blueprints dynamically
    # Python will bind 'app' to the module name in this scope, which does not clobber 'flask_app'
    from app.routes import all_blueprints
    for bp in all_blueprints:
        flask_app.register_blueprint(bp)

    # 6. Activate Centralized Logging and Error Handlers Middleware
    from app.middleware import register_middleware_and_errors
    register_middleware_and_errors(flask_app)

    # 7. Import models so Alembic can detect them for migrations
    with flask_app.app_context():
        import app.models

    return flask_app
