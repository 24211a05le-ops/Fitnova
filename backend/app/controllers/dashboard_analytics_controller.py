from datetime import datetime, timedelta

from flask_jwt_extended import get_jwt_identity
from app.models.fitness_profile import FitnessProfile
from app.models.prediction import MLPrediction
from app.models.weight_log import WeightLog
from app.models.workout import Workout
from app.services.insight_service import InsightService
from app.services.ml_service import MLService
from app.utils.responses import api_response, error_response

def get_future_weight_graph():
    try:
        user_id = int(get_jwt_identity())
        # Fetch weight logs
        logs = WeightLog.query.filter_by(user_id=user_id).order_by(WeightLog.date.asc()).all()

        current_weight = logs[-1].weight if logs else None
        if current_weight is None:
            return api_response(
                success=True,
                message="No weight history available yet",
                data={"current_weight": None, "historical": [], "projections": []},
            )

        # Predict future weight points
        predictions = MLService.predict_weight(current_weight, trend_14=0.0, trend_30=0.0, goal="maintain", activity_level="moderate")

        # Generate future projection dataset points
        historical = [{"date": log.date.isoformat(), "weight": log.weight, "type": "actual"} for log in logs[-5:]]
        
        projections = [
            {"date": "2 Weeks Later", "weight": predictions.get("predicted_weight_2_weeks", predictions.get("predicted_7_days")), "type": "predicted"},
            {"date": "1 Month Later", "weight": predictions.get("predicted_weight_1_month", predictions.get("predicted_30_days")), "type": "predicted"},
            {"date": "3 Months Later", "weight": predictions.get("predicted_weight_3_months", predictions.get("predicted_90_days")), "type": "predicted"}
        ]

        return api_response(
            success=True,
            message="Future weight projection dataset prepared",
            data={
                "current_weight": current_weight,
                "historical": historical,
                "projections": projections
            }
        )
    except Exception as e:
        return error_response(f"Could not load future weight: {str(e)}", status_code=500)

def get_consistency_graph():
    try:
        user_id = int(get_jwt_identity())
        
        # Pull past prediction outputs
        db_preds = MLPrediction.query.filter_by(user_id=int(user_id), prediction_type="consistency").order_by(MLPrediction.created_at.desc()).limit(10).all()
        
        history = []
        for p in reversed(db_preds):
            out_data = p.to_dict()["output_data"]
            history.append({
                "date": p.created_at.date().isoformat(),
                "dropout_risk": out_data.get("dropout_probability", out_data.get("dropout_risk_score", 10.0)),
                "consistency_probability": out_data.get("consistency_probability", 90.0),
                "label": out_data.get("label", "Likely Consistent")
            })

        if not history:
            workouts = Workout.query.filter_by(user_id=user_id).order_by(Workout.created_at.desc()).all()
            sessions = InsightService.group_workout_sessions(workouts)
            profile = FitnessProfile.query.filter_by(user_id=user_id).first()
            planned_days = profile.available_days if profile else 3

            for index in range(6, -1, -1):
                target_day = datetime.utcnow().date() - timedelta(days=index)
                rolling_sessions = [
                    session
                    for session in sessions
                    if session.get("created_at")
                    and (target_day - datetime.fromisoformat(session["created_at"]).date()).days in range(0, 7)
                ]
                workout_frequency = min(7, len(rolling_sessions))
                missed_sessions = max(0, planned_days - min(planned_days, workout_frequency))
                prediction = MLService.predict_dropout_risk(
                    workout_frequency=workout_frequency,
                    missed_sessions=missed_sessions,
                    login_days=max(1, workout_frequency * 3),
                    streak_days=InsightService.calculate_streak(rolling_sessions, today=target_day)[0],
                    session_duration=round(
                        sum(session["duration"] for session in rolling_sessions) / max(len(rolling_sessions), 1),
                        1,
                    ) if rolling_sessions else 0,
                )
                history.append(
                    {
                        "date": target_day.isoformat(),
                        "dropout_risk": prediction["dropout_probability"],
                        "consistency_probability": prediction["consistency_probability"],
                        "label": prediction["label"],
                    }
                )

        return api_response(success=True, message="Consistency graph fetched", data={"history": history})
    except Exception as e:
        return error_response(f"Could not load consistency graph: {str(e)}", status_code=500)

def get_recovery_trends():
    try:
        user_id = int(get_jwt_identity())
        
        db_preds = MLPrediction.query.filter_by(user_id=int(user_id), prediction_type="recovery").order_by(MLPrediction.created_at.desc()).limit(10).all()
        
        history = []
        for p in reversed(db_preds):
            out_data = p.to_dict()["output_data"]
            history.append({
                "date": p.created_at.date().isoformat(),
                "recovery_score": out_data.get("recovery_score", 80),
                "recovery_status": out_data.get("recovery_status", "High"),
                "label": out_data.get("label", "Fully Recovered")
            })

        if not history:
            workouts = Workout.query.filter_by(user_id=user_id).order_by(Workout.created_at.desc()).all()
            sessions = InsightService.group_workout_sessions(workouts)
            for session in sessions[:7]:
                if not session.get("created_at"):
                    continue
                intensity = max(
                    1,
                    min(
                        10,
                        round((session["calories"] or 200) / max(session["duration"] or 45, 1) / 1.5),
                    ),
                )
                prediction = MLService.predict_recovery_score(
                    sleep_hours=7.0,
                    workout_duration=session["duration"] or 45,
                    workout_intensity=intensity,
                    muscle_soreness=min(8, max(2, len(session["exercises"]))),
                    calories_burned=session["calories"] or 200,
                )
                history.append(
                    {
                        "date": session["date"],
                        "recovery_score": prediction["recovery_score"],
                        "recovery_status": prediction["recovery_status"],
                        "label": prediction["label"],
                    }
                )
            history.reverse()

        return api_response(success=True, message="Recovery trends fetched", data={"history": history})
    except Exception as e:
        return error_response(f"Could not load recovery trends: {str(e)}", status_code=500)
