import json
from flask import request
from flask_jwt_extended import get_jwt_identity
from app import db
from app.models.prediction import MLPrediction
from app.services.ml_service import MLService
from app.utils.responses import api_response, error_response

def predict_weight():
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}
        
        current = float(data.get("current_weight", 80.0))
        calories = int(data.get("calorie_intake", 2000))
        freq = float(data.get("workout_frequency", 3.0))
        steps = int(data.get("steps", 8000))
        sleep = float(data.get("sleep", 7.0))
        consistency = float(data.get("consistency_score", 0.8))

        pred = MLService.predict_weight(current, calories, freq, steps, sleep, consistency)

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
        
        streak = int(data.get("streak_days", 5))
        skipped = int(data.get("skipped_workouts", 1))
        activity = int(data.get("app_activity", 10))
        freq = float(data.get("workout_frequency", 3.0))
        duration = float(data.get("session_duration", 45.0))

        pred = MLService.predict_dropout_risk(streak, skipped, activity, freq, duration)

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
        
        soreness = int(data.get("soreness", 3))
        sleep = float(data.get("sleep", 7.5))
        calories = int(data.get("calories", 2000))
        intensity = int(data.get("workout_intensity", 5))
        stress = int(data.get("stress_level", 3))

        pred = MLService.predict_recovery_score(soreness, sleep, calories, intensity, stress)

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
        
        weight = float(data.get("prev_weight", 60.0))
        reps = int(data.get("reps_completed", 10))
        fatigue = int(data.get("fatigue_level", 5))
        consistency = float(data.get("consistency", 0.8))

        pred = MLService.predict_progressive_overload(weight, reps, fatigue, consistency)

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
            "overload_model_mse": round(overload_mse, 5)
        }

        return api_response(success=True, message="All machine learning models retrained successfully", data=scores)
    except Exception as e:
        return error_response(f"Model retraining failed: {str(e)}", status_code=500)
