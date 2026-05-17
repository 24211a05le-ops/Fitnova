from flask import request
from flask_jwt_extended import get_jwt_identity
from app import db
from app.models.progress_log import ProgressLog
from app.utils.responses import api_response, error_response

def create_progress():
    """Logs a new physical metric checkpoint POST request"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        if not data:
            return error_response("Request payload is empty or not JSON format", status_code=400)

        # Enforce weight is required
        if "weight" not in data:
            return error_response("Current Weight is a required physical metric checkpoint", status_code=400)

        # Numeric value casting checks
        try:
            weight = float(data.get("weight"))
            body_fat = float(data.get("body_fat")) if data.get("body_fat") is not None else None
            muscle_mass = float(data.get("muscle_mass")) if data.get("muscle_mass") is not None else None
        except ValueError:
            return error_response("Weight, body_fat, and muscle_mass must be valid positive numbers", status_code=400)

        progress = ProgressLog(
            user_id=user_id,
            weight=weight,
            body_fat=body_fat,
            muscle_mass=muscle_mass,
            notes=data.get("notes", "").strip()
        )

        db.session.add(progress)
        db.session.commit()

        return api_response(
            success=True, 
            message="Physical progress checkpoint logged successfully", 
            data=progress.to_dict(),
            status_code=201
        )

    except Exception as e:
        db.session.rollback()
        return error_response(f"Could not save progress checkpoint: {str(e)}", status_code=500)

def get_progress():
    """Lists all physical biometric checkpoints recorded by the user"""
    try:
        user_id = get_jwt_identity()
        logs = ProgressLog.query.filter_by(user_id=user_id).order_by(ProgressLog.created_at.desc()).all()
        
        logs_data = [log.to_dict() for log in logs]
        return api_response(success=True, message="Physical progress logs fetched successfully", data=logs_data)
    except Exception as e:
        return error_response(f"Could not load progress logs: {str(e)}", status_code=500)

def update_progress(log_id):
    """Edits details of an existing physical biometric checkpoint log"""
    try:
        user_id = get_jwt_identity()
        progress = ProgressLog.query.filter_by(id=log_id, user_id=user_id).first()
        if not progress:
            return error_response("Progress log not found", status_code=404)

        data = request.get_json()
        if not data:
            return error_response("Request payload is empty or not JSON format", status_code=400)

        # Parse stats safely
        try:
            if "weight" in data:
                progress.weight = float(data.get("weight"))
            if "body_fat" in data:
                progress.body_fat = float(data.get("body_fat"))
            if "muscle_mass" in data:
                progress.muscle_mass = float(data.get("muscle_mass"))
        except ValueError:
            return error_response("Weight, body fat, and muscle mass metrics must be valid numbers", status_code=400)

        if "notes" in data:
            progress.notes = data.get("notes", "").strip()

        db.session.commit()
        return api_response(success=True, message="Progress checkpoint updated successfully", data=progress.to_dict())

    except Exception as e:
        db.session.rollback()
        return error_response(f"Could not update progress checkpoint: {str(e)}", status_code=500)

def delete_progress(log_id):
    """Permanently deletes a physical progress checkpoint log from the database"""
    try:
        user_id = get_jwt_identity()
        progress = ProgressLog.query.filter_by(id=log_id, user_id=user_id).first()
        if not progress:
            return error_response("Progress log not found", status_code=404)

        db.session.delete(progress)
        db.session.commit()
        return api_response(success=True, message="Progress checkpoint deleted successfully")
    except Exception as e:
        db.session.rollback()
        return error_response(f"Could not delete progress checkpoint: {str(e)}", status_code=500)
