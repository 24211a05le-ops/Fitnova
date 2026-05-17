from flask import Blueprint
from flask_jwt_extended import jwt_required
from app.controllers.user_controller import get_profile, update_profile, delete_profile, submit_onboarding

user_bp = Blueprint('user', __name__, url_prefix='/api')

# Protected Profile Routes
user_bp.route('/profile', methods=['GET'])(jwt_required()(get_profile))
user_bp.route('/profile', methods=['PUT'])(jwt_required()(update_profile))
user_bp.route('/profile', methods=['DELETE'])(jwt_required()(delete_profile))
user_bp.route('/onboarding', methods=['POST'])(jwt_required()(submit_onboarding))
