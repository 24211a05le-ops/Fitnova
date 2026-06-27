import json
from datetime import datetime
from flask import request
from flask_jwt_extended import get_jwt_identity
from app import db
from app.models.prediction import MLPrediction
from app.models.ml_model_metric import MLModelMetric
from app.models.weight_log import WeightLog
from app.models.workout import Workout
from app.models.fitness_profile import FitnessProfile
from app.services.ml_service import MLService
from app.utils.responses import api_response, error_response

def predict_weight():
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}

        logs = WeightLog.query.filter_by(user_id=int(user_id)).order_by(WeightLog.date.asc()).all()
        current = float(data.get("current_weight") or (logs[-1].weight if logs else 80.0))

        trend_14 = float(data.get("trend_14", 0.0))
        trend_30 = float(data.get("trend_30", 0.0))

        if logs and len(logs) >= 2 and ("trend_14" not in data or "trend_30" not in data):
            latest_date = logs[-1].date
            w14 = next((l.weight for l in reversed(logs) if (latest_date - l.date).days >= 14), logs[0].weight)
            w30 = next((l.weight for l in reversed(logs) if (latest_date - l.date).days >= 30), logs[0].weight)
            if "trend_14" not in data:
                trend_14 = current - float(w14)
            if "trend_30" not in data:
                trend_30 = current - float(w30)

        profile = FitnessProfile.query.filter_by(user_id=int(user_id)).first()
        goal = data.get("goal") or data.get("fitness_goal") or (profile.fitness_goal if profile else "maintain")

        activity_level = data.get("activity_level")
        if activity_level is None:
            available_days = profile.available_days if profile and profile.available_days else 3
            if available_days <= 1:
                activity_level = "sedentary"
            elif available_days <= 3:
                activity_level = "light"
            elif available_days <= 5:
                activity_level = "moderate"
            else:
                activity_level = "active"

        pred = MLService.predict_weight(current, trend_14, trend_30, goal, activity_level)

        # Log prediction
        db_pred = MLPrediction(
            user_id=int(user_id),
            prediction_type="weight",
            input_data=json.dumps(data),
            output_data=json.dumps(pred)
        )
        db.session.add(db_pred)
        db.session.commit()

        return api_response(success=True, message="Weight prediction successfully calculated", data=pred)
    except Exception as e:
        db.session.rollback()
        return error_response(f"Weight prediction failed: {str(e)}", status_code=500)

def predict_consistency():
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}

        workouts = Workout.query.filter_by(user_id=int(user_id)).order_by(Workout.created_at.asc()).all()

        freq = float(data.get("workout_frequency", min(len(workouts), 7)))
        missed = float(data.get("missed_sessions", data.get("skipped_workouts", 0)))

        if "missed_sessions" not in data and "skipped_workouts" not in data and workouts:
            last_14 = [w for w in workouts if (datetime.utcnow() - w.created_at).days <= 14]
            expected_sessions = 6
            missed = max(0, expected_sessions - len(last_14))

        login_days = float(data.get("login_days", data.get("app_activity", 10)))
        streak = float(data.get("streak_days", 0))
        duration = float(data.get("session_duration", 45.0))

        pred = MLService.predict_dropout_risk(freq, missed, login_days, streak, duration)

        # Log prediction
        db_pred = MLPrediction(
            user_id=int(user_id),
            prediction_type="consistency",
            input_data=json.dumps(data),
            output_data=json.dumps(pred)
        )
        db.session.add(db_pred)
        db.session.commit()

        return api_response(success=True, message="Dropout risk analysis completed", data=pred)
    except Exception as e:
        db.session.rollback()
        return error_response(f"Consistency prediction failed: {str(e)}", status_code=500)

def predict_recovery():
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}

        sleep = float(data.get("sleep_hours", data.get("sleep", 7.5)))
        duration = float(data.get("workout_duration", data.get("duration", 50.0)))
        intensity = float(data.get("workout_intensity", 5))
        soreness = float(data.get("muscle_soreness", data.get("soreness", 3)))
        calories_burned = float(data.get("calories_burned", data.get("calories", 350)))

        pred = MLService.predict_recovery_score(sleep, duration, intensity, soreness, calories_burned)

        # Log prediction
        db_pred = MLPrediction(
            user_id=int(user_id),
            prediction_type="recovery",
            input_data=json.dumps(data),
            output_data=json.dumps(pred)
        )
        db.session.add(db_pred)
        db.session.commit()

        return api_response(success=True, message="Recovery score model analyzed successfully", data=pred)
    except Exception as e:
        db.session.rollback()
        return error_response(f"Recovery prediction failed: {str(e)}", status_code=500)

def predict_progressive_overload():
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}

        weight = float(data.get("prev_weight", data.get("last_weight", 60.0)))
        reps = int(data.get("reps_completed", data.get("last_reps", 8)))
        sets = int(data.get("sets_completed", data.get("last_sets", 3)))
        trend = float(data.get("exercise_trend", 0.0))

        pred = MLService.predict_progressive_overload(weight, reps, sets, trend)

        # Log prediction
        db_pred = MLPrediction(
            user_id=int(user_id),
            prediction_type="progressive_overload",
            input_data=json.dumps(data),
            output_data=json.dumps(pred)
        )
        db.session.add(db_pred)
        db.session.commit()

        return api_response(success=True, message="Progressive overload suggestion computed", data=pred)
    except Exception as e:
        db.session.rollback()
        return error_response(f"Progressive overload prediction failed: {str(e)}", status_code=500)

def retrain_models():
    try:
        print("[ML Controller] Triggering retraining pipeline scripts...")
        weight_mse = MLService.train_weight_model()
        consistency_acc = MLService.train_consistency_model()
        recovery_mse = MLService.train_recovery_model()
        overload_mse = MLService.train_overload_model()

        scores = {
            "weight_model_mse": round(weight_mse, 5),
            "consistency_model_accuracy": round(consistency_acc, 5),
            "recovery_model_mse": round(recovery_mse, 5),
            "overload_model_mse": round(overload_mse, 5),
            "latest_metrics": {
                metric.model_name: metric.to_dict()
                for metric in MLModelMetric.query.order_by(MLModelMetric.created_at.desc()).all()
            }
        }

        return api_response(success=True, message="All machine learning models retrained successfully", data=scores)
    except Exception as e:
        return error_response(f"Model retraining failed: {str(e)}", status_code=500)
