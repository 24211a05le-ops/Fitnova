# pyrefly: ignore [missing-import]
from flask import Blueprint
from flask_jwt_extended import jwt_required
from app.controllers.auth_controller import register_user, login_user, logout_user, verify_session, refresh_session

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# Public Endpoints
auth_bp.route('/register', methods=['POST'])(register_user)
auth_bp.route('/login', methods=['POST'])(login_user)
auth_bp.route('/logout', methods=['POST'])(logout_user)

# Protected Endpoints
auth_bp.route('/verify', methods=['GET'])(jwt_required()(verify_session))
auth_bp.route('/refresh', methods=['POST'])(jwt_required(refresh=True)(refresh_session))
