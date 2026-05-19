from flask import Blueprint
from flask_jwt_extended import jwt_required

# Import AI endpoints
from app.controllers.ai_controller import (
    generate_workout, get_workout_plans, chat, get_chat_history,
    recovery_suggestions, onboarding_analyzer, diet_planner, get_meal_plans,
    exercise_smart_search
)

# Import ML endpoints
from app.controllers.ml_controller import (
    predict_weight, predict_consistency, predict_recovery, predict_progressive_overload,
    retrain_models
)

# Import Dashboard endpoints
from app.controllers.dashboard_analytics_controller import (
    get_future_weight_graph, get_consistency_graph, get_recovery_trends
)

ai_ml_bp = Blueprint('ai_ml', __name__, url_prefix='/api')

# ====================================================
# PART 1 — AI ROUTES
# ====================================================
ai_ml_bp.route('/ai/generate-workout', methods=['POST'])(jwt_required()(generate_workout))
ai_ml_bp.route('/ai/workout-plans', methods=['GET'])(jwt_required()(get_workout_plans))
ai_ml_bp.route('/ai/chat', methods=['POST'])(jwt_required()(chat))
ai_ml_bp.route('/ai/chat-history', methods=['GET'])(jwt_required()(get_chat_history))
ai_ml_bp.route('/ai/recovery-suggestions', methods=['POST'])(jwt_required()(recovery_suggestions))
ai_ml_bp.route('/ai/onboarding-analyzer', methods=['GET'])(jwt_required()(onboarding_analyzer))
ai_ml_bp.route('/ai/diet-planner', methods=['POST'])(jwt_required()(diet_planner))
ai_ml_bp.route('/ai/meal-plans', methods=['GET'])(jwt_required()(get_meal_plans))
ai_ml_bp.route('/ai/exercise-search', methods=['GET'])(jwt_required()(exercise_smart_search))

# ====================================================
# PART 2 — ML ROUTES
# ====================================================
ai_ml_bp.route('/ml/predict-weight', methods=['POST'])(jwt_required()(predict_weight))
ai_ml_bp.route('/ml/predict-consistency', methods=['POST'])(jwt_required()(predict_consistency))
ai_ml_bp.route('/ml/predict-recovery', methods=['POST'])(jwt_required()(predict_recovery))
ai_ml_bp.route('/ml/predict-overload', methods=['POST'])(jwt_required()(predict_progressive_overload))
ai_ml_bp.route('/ml/retrain', methods=['POST'])(jwt_required()(retrain_models))

# ====================================================
# PART 3 — DASHBOARD ML ANALYTICS
# ====================================================
ai_ml_bp.route('/ml/dashboard/future-weight', methods=['GET'])(jwt_required()(get_future_weight_graph))
ai_ml_bp.route('/ml/dashboard/consistency', methods=['GET'])(jwt_required()(get_consistency_graph))
ai_ml_bp.route('/ml/dashboard/recovery', methods=['GET'])(jwt_required()(get_recovery_trends))
