import time
import logging
from flask import request
from sqlalchemy.exc import SQLAlchemyError
from app.utils.responses import error_response

# Configure console logging format
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s in %(module)s: %(message)s'
)
logger = logging.getLogger('fitnova_backend')

def register_middleware_and_errors(app):
    """
    Registers request/response logging hooks and centralized error handlers
    directly at the Flask app instance level.
    """
    
    # ==========================================
    # 1. Logging & Performance Telemetry
    # ==========================================
    @app.before_request
    def start_timer():
        request.start_time = time.time()

    @app.after_request
    def log_request_telemetry(response):
        # Ignore static assets or dev health-checks if any
        if request.path.startswith('/static'):
            return response
            
        latency_ms = int((time.time() - request.start_time) * 1000)
        logger.info(
            f"{request.remote_addr} - \"{request.method} {request.path} {request.scheme.upper()}\" "
            f"{response.status_code} - {latency_ms}ms"
        )
        return response

    # ==========================================
    # 2. Centralized Error Handlers
    # ==========================================
    @app.errorhandler(400)
    def bad_request_handler(err):
        return error_response(
            message=getattr(err, "description", "Bad Request: Request validation failed."), 
            status_code=400
        )

    @app.errorhandler(401)
    def unauthorized_handler(err):
        return error_response(
            message=getattr(err, "description", "Unauthorized: Valid access token required."), 
            status_code=401
        )

    @app.errorhandler(403)
    def forbidden_handler(err):
        return error_response(
            message=getattr(err, "description", "Forbidden: You do not have permissions for this resource."), 
            status_code=403
        )

    @app.errorhandler(404)
    def not_found_handler(err):
        return error_response(
            message=f"Not Found: The path '{request.path}' does not exist on this server.", 
            status_code=404
        )

    @app.errorhandler(405)
    def method_not_allowed_handler(err):
        return error_response(
            message=f"Method Not Allowed: The method '{request.method}' is not supported for this path.", 
            status_code=405
        )

    @app.errorhandler(SQLAlchemyError)
    def database_error_handler(err):
        logger.error(f"Database Exception: {str(err)}")
        return error_response(
            message="A database integrity exception occurred. Please verify field constraints.", 
            status_code=409
        )

    @app.errorhandler(Exception)
    def global_exception_handler(err):
        logger.error(f"Unhandled Exception: {str(err)}", exc_info=True)
        return error_response(
            message="An unexpected system failure occurred on the server.", 
            status_code=500
        )
