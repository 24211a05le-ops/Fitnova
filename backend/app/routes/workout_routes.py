from flask import Blueprint
from flask_jwt_extended import jwt_required
from app.controllers.workout_controller import (
    create_workout,
    get_workouts,
    get_workout,
    update_workout,
    delete_workout
)

workout_bp = Blueprint('workout', __name__, url_prefix='/api/workouts')

# Protected Workout CRUD Endpoints
workout_bp.route('', methods=['POST'])(jwt_required()(create_workout))
workout_bp.route('', methods=['GET'])(jwt_required()(get_workouts))
workout_bp.route('/<int:workout_id>', methods=['GET'])(jwt_required()(get_workout))
workout_bp.route('/<int:workout_id>', methods=['PUT'])(jwt_required()(update_workout))
workout_bp.route('/<int:workout_id>', methods=['DELETE'])(jwt_required()(delete_workout))
