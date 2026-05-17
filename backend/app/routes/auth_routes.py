from flask import Blueprint
from app.controllers.auth_controller import register_user, login_user, logout_user

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# Public Endpoints
auth_bp.route('/register', methods=['POST'])(register_user)
auth_bp.route('/login', methods=['POST'])(login_user)
auth_bp.route('/logout', methods=['POST'])(logout_user)
