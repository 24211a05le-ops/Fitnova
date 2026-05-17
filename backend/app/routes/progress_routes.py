from flask import Blueprint
from flask_jwt_extended import jwt_required
from app.controllers.progress_controller import (
    create_progress,
    get_progress,
    update_progress,
    delete_progress
)

progress_bp = Blueprint('progress', __name__, url_prefix='/api/progress')

# Protected Progress Biometric Checkpoint Endpoints
progress_bp.route('', methods=['POST'])(jwt_required()(create_progress))
progress_bp.route('', methods=['GET'])(jwt_required()(get_progress))
progress_bp.route('/<int:log_id>', methods=['PUT'])(jwt_required()(update_progress))
progress_bp.route('/<int:log_id>', methods=['DELETE'])(jwt_required()(delete_progress))
