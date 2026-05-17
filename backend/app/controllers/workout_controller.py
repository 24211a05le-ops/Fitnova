from flask import request
from flask_jwt_extended import get_jwt_identity
from app import db
from app.models.workout import Workout
from app.utils.responses import api_response, error_response

def create_workout():
    """Logs a new workout entry POST request"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        if not data:
            return error_response("Request payload is empty or not JSON format", status_code=400)

        # Enforce required parameters validation
        required_fields = ["workout_name", "exercise_name"]
        for field in required_fields:
            if not data.get(field):
                return error_response(f"Field '{field}' is required", status_code=400)

        # Numeric and type casting validation
        try:
            sets = int(data.get("sets", 1))
            reps = int(data.get("reps", 1))
            calories_burned = int(data.get("calories_burned") or data.get("calories", 0))
            duration = int(data.get("duration", 0))
        except ValueError:
            return error_response("Sets, reps, calories_burned, and duration must be valid integers", status_code=400)

        workout = Workout(
            user_id=user_id,
            workout_name=data.get("workout_name").strip(),
            exercise_name=data.get("exercise_name").strip(),
            sets=sets,
            reps=reps,
            calories_burned=calories_burned,
            duration=duration
        )

        db.session.add(workout)
        db.session.commit()

        return api_response(
            success=True, 
            message="Workout routine synchronized successfully with backend database", 
            data=workout.to_dict(),
            status_code=201
        )

    except Exception as e:
        db.session.rollback()
        return error_response(f"Could not save workout: {str(e)}", status_code=500)

def get_workouts():
    """Lists all workouts recorded by the active authenticated user"""
    try:
        user_id = get_jwt_identity()
        workouts = Workout.query.filter_by(user_id=user_id).order_by(Workout.created_at.desc()).all()
        
        workouts_data = [w.to_dict() for w in workouts]
        return api_response(success=True, message="Workouts fetched successfully", data=workouts_data)
    except Exception as e:
        return error_response(f"Could not load workouts list: {str(e)}", status_code=500)

def get_workout(workout_id):
    """Fetches details of a specific workout log record"""
    try:
        user_id = get_jwt_identity()
        workout = Workout.query.filter_by(id=workout_id, user_id=user_id).first()
        if not workout:
            return error_response("Workout record not found", status_code=404)
            
        return api_response(success=True, message="Workout details fetched successfully", data=workout.to_dict())
    except Exception as e:
        return error_response(f"Could not load workout: {str(e)}", status_code=500)

def update_workout(workout_id):
    """Edits details of an existing workout log record"""
    try:
        user_id = get_jwt_identity()
        workout = Workout.query.filter_by(id=workout_id, user_id=user_id).first()
        if not workout:
            return error_response("Workout record not found", status_code=404)

        data = request.get_json()
        if not data:
            return error_response("Request payload is empty or not JSON format", status_code=400)

        # Apply edits safely
        if "workout_name" in data:
            workout.workout_name = data.get("workout_name").strip()
        if "exercise_name" in data:
            workout.exercise_name = data.get("exercise_name").strip()
            
        # Parse integers with safety
        try:
            if "sets" in data:
                workout.sets = int(data.get("sets"))
            if "reps" in data:
                workout.reps = int(data.get("reps"))
            if "calories_burned" in data or "calories" in data:
                workout.calories_burned = int(data.get("calories_burned") or data.get("calories"))
            if "duration" in data:
                workout.duration = int(data.get("duration"))
        except ValueError:
            return error_response("Numerical stats (sets, reps, calories, duration) must be valid integers", status_code=400)

        db.session.commit()
        return api_response(success=True, message="Workout record updated successfully", data=workout.to_dict())

    except Exception as e:
        db.session.rollback()
        return error_response(f"Could not update workout record: {str(e)}", status_code=500)

def delete_workout(workout_id):
    """Permanently deletes a workout log from the database"""
    try:
        user_id = get_jwt_identity()
        workout = Workout.query.filter_by(id=workout_id, user_id=user_id).first()
        if not workout:
            return error_response("Workout record not found", status_code=404)

        db.session.delete(workout)
        db.session.commit()
        return api_response(success=True, message="Workout record deleted successfully")
    except Exception as e:
        db.session.rollback()
        return error_response(f"Could not delete workout record: {str(e)}", status_code=500)
