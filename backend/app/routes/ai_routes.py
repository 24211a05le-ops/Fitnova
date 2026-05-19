from flask import Blueprint
from flask_jwt_extended import jwt_required
from app.controllers.ai_workout_controller import generate_ai_workout, get_ai_workout_plans, get_dashboard_widgets

ai_bp = Blueprint('ai', __name__, url_prefix='/api/ai')

ai_bp.route('/generate-workout', methods=['POST'])(jwt_required()(generate_ai_workout))
ai_bp.route('/workout-plans', methods=['GET'])(jwt_required()(get_ai_workout_plans))
ai_bp.route('/dashboard-widgets', methods=['GET'])(jwt_required()(get_dashboard_widgets))
