from flask import request
from flask_jwt_extended import get_jwt_identity
from app import db
from app.models.prediction import MLPrediction
from app.models.weight_log import WeightLog
from app.services.ml_service import MLService
from app.utils.responses import api_response, error_response

def get_future_weight_graph():
    try:
        user_id = get_jwt_identity()
        # Fetch weight logs
        logs = WeightLog.query.filter_by(user_id=int(user_id)).order_by(WeightLog.date.asc()).all()
        
        current_weight = 80.0
        if logs:
            current_weight = logs[-1].weight

        # Predict future weight points
        predictions = MLService.predict_weight(current_weight, 2000, 3, 8000, 7.5, 0.8)

        # Generate future projection dataset points
        historical = [{"date": log.date.isoformat(), "weight": log.weight, "type": "actual"} for log in logs[-5:]]
        
        projections = [
            {"date": "7 Days Later", "weight": predictions["predicted_7_days"], "type": "predicted"},
            {"date": "30 Days Later", "weight": predictions["predicted_30_days"], "type": "predicted"},
            {"date": "90 Days Later", "weight": predictions["predicted_90_days"], "type": "predicted"}
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
        user_id = get_jwt_identity()
        
        # Pull past prediction outputs
        db_preds = MLPrediction.query.filter_by(user_id=int(user_id), prediction_type="consistency").order_by(MLPrediction.created_at.desc()).limit(10).all()
        
        history = []
        for p in reversed(db_preds):
            out_data = p.to_dict()["output_data"]
            history.append({
                "date": p.created_at.date().isoformat(),
                "dropout_risk": out_data.get("dropout_risk_score", 10.0),
                "label": out_data.get("label", "Low Risk")
            })

        # Base mock trends if historical tracking is empty
        if not history:
            history = [
                {"date": "Day 1", "dropout_risk": 45.0, "label": "Moderate Risk"},
                {"date": "Day 2", "dropout_risk": 35.0, "label": "Low Risk"},
                {"date": "Day 3", "dropout_risk": 20.0, "label": "Low Risk"},
                {"date": "Day 4", "dropout_risk": 15.0, "label": "Low Risk"}
            ]

        return api_response(success=True, message="Consistency graph fetched", data={"history": history})
    except Exception as e:
        return error_response(f"Could not load consistency graph: {str(e)}", status_code=500)

def get_recovery_trends():
    try:
        user_id = get_jwt_identity()
        
        db_preds = MLPrediction.query.filter_by(user_id=int(user_id), prediction_type="recovery").order_by(MLPrediction.created_at.desc()).limit(10).all()
        
        history = []
        for p in reversed(db_preds):
            out_data = p.to_dict()["output_data"]
            history.append({
                "date": p.created_at.date().isoformat(),
                "recovery_score": out_data.get("recovery_score", 80),
                "label": out_data.get("label", "Fully Recovered")
            })

        if not history:
            history = [
                {"date": "Yesterday", "recovery_score": 60, "label": "Moderately Recovered"},
                {"date": "Today", "recovery_score": 85, "label": "Fully Recovered"}
            ]

        return api_response(success=True, message="Recovery trends fetched", data={"history": history})
    except Exception as e:
        return error_response(f"Could not load recovery trends: {str(e)}", status_code=500)
