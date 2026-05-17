from flask import Blueprint
from flask_jwt_extended import jwt_required
from app.controllers.dashboard_controller import get_dashboard_metrics

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

# Protected Dashboard Telemetry Compilation
dashboard_bp.route('', methods=['GET'])(jwt_required()(get_dashboard_metrics))
