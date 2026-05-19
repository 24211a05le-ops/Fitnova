from flask import request
from flask_jwt_extended import get_jwt_identity
from datetime import datetime, timedelta
from app import db
from app.models.weight_log import WeightLog
from app.utils.responses import api_response, error_response

def add_weight_log():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        if not data or not data.get("weight"):
            return error_response("Weight value is required", status_code=400)
        log_date = data.get("date")
        if log_date:
            try:
                log_date = datetime.strptime(log_date, "%Y-%m-%d").date()
            except ValueError:
                return error_response("Date must be in YYYY-MM-DD format", status_code=400)
        else:
            log_date = datetime.utcnow().date()
        weight_log = WeightLog(user_id=int(user_id), weight=float(data["weight"]), date=log_date, notes=data.get("notes", ""), photo_url=data.get("photo_url"))
        db.session.add(weight_log)
        db.session.commit()
        return api_response(success=True, message="Weight logged successfully", data=weight_log.to_dict(), status_code=201)
    except Exception as e:
        db.session.rollback()
        return error_response(f"Could not log weight: {str(e)}", status_code=500)

def get_weight_logs():
    try:
        user_id = get_jwt_identity()
        range_param = request.args.get("range", "all")
        query = WeightLog.query.filter_by(user_id=int(user_id))
        if range_param == "week":
            query = query.filter(WeightLog.date >= datetime.utcnow().date() - timedelta(days=7))
        elif range_param == "month":
            query = query.filter(WeightLog.date >= datetime.utcnow().date() - timedelta(days=30))
        logs = query.order_by(WeightLog.date.desc()).all()
        return api_response(success=True, message=f"Retrieved {len(logs)} weight log(s)", data={"logs": [l.to_dict() for l in logs]})
    except Exception as e:
        return error_response(f"Could not fetch weight logs: {str(e)}", status_code=500)

def delete_weight_log(log_id):
    try:
        user_id = get_jwt_identity()
        log = WeightLog.query.filter_by(id=log_id, user_id=int(user_id)).first()
        if not log:
            return error_response("Weight log not found", status_code=404)
        db.session.delete(log)
        db.session.commit()
        return api_response(success=True, message="Weight log deleted successfully")
    except Exception as e:
        db.session.rollback()
        return error_response(f"Could not delete weight log: {str(e)}", status_code=500)

def get_weight_stats():
    try:
        user_id = get_jwt_identity()
        logs = WeightLog.query.filter_by(user_id=int(user_id)).order_by(WeightLog.date.desc()).all()
        if not logs:
            return api_response(success=True, message="No weight data", data={"current_weight": None, "total_change": 0, "total_entries": 0})
        current = logs[0].weight
        start = logs[-1].weight
        return api_response(success=True, message="Weight stats", data={"current_weight": current, "start_weight": start, "total_change": round(current - start, 2), "total_entries": len(logs)})
    except Exception as e:
        return error_response(f"Could not compute stats: {str(e)}", status_code=500)
