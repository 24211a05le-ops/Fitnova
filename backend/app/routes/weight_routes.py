from flask import Blueprint
from flask_jwt_extended import jwt_required
from app.controllers.weight_controller import add_weight_log, get_weight_logs, delete_weight_log, get_weight_stats

weight_bp = Blueprint('weight', __name__, url_prefix='/api/weight')

weight_bp.route('', methods=['POST'])(jwt_required()(add_weight_log))
weight_bp.route('', methods=['GET'])(jwt_required()(get_weight_logs))
weight_bp.route('/stats', methods=['GET'])(jwt_required()(get_weight_stats))
weight_bp.route('/<int:log_id>', methods=['DELETE'])(jwt_required()(delete_weight_log))
