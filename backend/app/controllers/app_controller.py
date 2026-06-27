from flask_jwt_extended import get_jwt_identity

from app.models.ai_chat_history import AIChatHistory
from app.models.ai_workout_plan import AIWorkoutPlan
from app.models.fitness_profile import FitnessProfile
from app.models.meal_plan import MealPlan
from app.models.prediction import MLPrediction
from app.models.progress_log import ProgressLog
from app.models.user import User
from app.models.weight_log import WeightLog
from app.models.workout import Workout
from app.services.insight_service import InsightService
from app.utils.responses import api_response, error_response


def get_app_overview():
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        if not user:
            return error_response("User profile not found", status_code=404)

        workouts = Workout.query.filter_by(user_id=user_id).order_by(Workout.created_at.desc()).all()
        sessions = InsightService.group_workout_sessions(workouts)
        weight_logs = WeightLog.query.filter_by(user_id=user_id).order_by(WeightLog.date.desc()).all()
        progress_logs = ProgressLog.query.filter_by(user_id=user_id).order_by(ProgressLog.created_at.desc()).all()
        fitness_profile = FitnessProfile.query.filter_by(user_id=user_id).first()
        meal_plans = MealPlan.query.filter_by(user_id=user_id).order_by(MealPlan.created_at.desc()).limit(5).all()
        workout_plans = AIWorkoutPlan.query.filter_by(user_id=user_id).order_by(AIWorkoutPlan.created_at.desc()).limit(5).all()
        chat_history = AIChatHistory.query.filter_by(user_id=user_id).order_by(AIChatHistory.created_at.desc()).limit(5).all()
        predictions = MLPrediction.query.filter_by(user_id=user_id).order_by(MLPrediction.created_at.desc()).limit(20).all()
        exercise_catalog = InsightService.get_exercise_catalog()

        planned_days = fitness_profile.available_days if fitness_profile else 3

        data = {
            "dashboard": InsightService.build_dashboard_widgets(
                user=user,
                sessions=sessions,
                weight_logs=weight_logs,
                fitness_profile=fitness_profile,
                exercise_catalog=exercise_catalog,
            ),
            "attendance": InsightService.build_attendance_summary(
                sessions=sessions,
                planned_days=planned_days,
            ),
            "goals": InsightService.build_goal_summary(
                user=user,
                sessions=sessions,
                weight_logs=weight_logs,
                planned_days=planned_days,
            ),
            "profile": InsightService.build_profile_summary(
                user=user,
                fitness_profile=fitness_profile,
                sessions=sessions,
                weight_logs=weight_logs,
                progress_logs=progress_logs,
            ),
            "notifications": InsightService.build_notifications(
                sessions=sessions,
                weight_logs=weight_logs,
                meal_plans=meal_plans,
                workout_plans=workout_plans,
                chat_history=chat_history,
            ),
            "reports": InsightService.build_reports_summary(
                sessions=sessions,
                weight_logs=weight_logs,
                progress_logs=progress_logs,
                predictions=predictions,
            ),
        }

        return api_response(success=True, message="Application overview fetched", data=data)
    except Exception as e:
        return error_response(f"Could not load application overview: {str(e)}", status_code=500)


def get_exercise_library():
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        if not user:
            return error_response("User profile not found", status_code=404)

        workouts = Workout.query.filter_by(user_id=user_id).order_by(Workout.created_at.desc()).all()
        sessions = InsightService.group_workout_sessions(workouts)
        data = InsightService.build_exercise_data(user=user, sessions=sessions)
        return api_response(success=True, message="Exercise library fetched", data=data)
    except Exception as e:
        return error_response(f"Could not load exercise library: {str(e)}", status_code=500)
