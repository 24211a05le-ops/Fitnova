from flask import request
from flask_jwt_extended import get_jwt_identity
from app import db
from app.models.user import User
from app.utils.responses import api_response, error_response

def get_profile():
    """Fetches biological details of the active authenticated user"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user:
            return error_response("User profile not found", status_code=404)
            
        return api_response(success=True, message="Profile fetched successfully", data=user.to_dict())
    except Exception as e:
        return error_response(f"Could not load profile: {str(e)}", status_code=500)

def update_profile():
    """Updates user vitals (age, height, weight, gender, fitness goal)"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user:
            return error_response("User profile not found", status_code=404)

        data = request.get_json()
        if not data:
            return error_response("Request payload is empty or not JSON", status_code=400)

        # Update profile stats safely
        if "name" in data:
            user.name = data.get("name").strip()
            
        # Optional biometric updates with numeric validation
        if "age" in data:
            age = data.get("age")
            if age is not None:
                try:
                    user.age = int(age)
                except ValueError:
                    return error_response("Age must be a valid positive integer", status_code=400)
                    
        if "gender" in data:
            user.gender = data.get("gender")
            
        if "height" in data:
            height = data.get("height")
            if height is not None:
                try:
                    user.height = float(height)
                except ValueError:
                    return error_response("Height must be a valid positive number", status_code=400)
                    
        if "weight" in data:
            weight = data.get("weight")
            if weight is not None:
                try:
                    user.weight = float(weight)
                except ValueError:
                    return error_response("Weight must be a valid positive number", status_code=400)

        if "fitnessGoal" in data or "fitness_goal" in data:
            user.fitness_goal = data.get("fitnessGoal") or data.get("fitness_goal")

        db.session.commit()
        return api_response(success=True, message="Profile metrics updated successfully", data=user.to_dict())

    except Exception as e:
        db.session.rollback()
        return error_response(f"Could not update profile: {str(e)}", status_code=500)

def delete_profile():
    """Safely removes the user profile and all associated logs from the database"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user:
            return error_response("User profile not found", status_code=404)

        db.session.delete(user)
        db.session.commit()
        return api_response(success=True, message="Your account and all associated workout histories have been deleted successfully")
    except Exception as e:
        db.session.rollback()
        return error_response(f"Could not complete deletion request: {str(e)}", status_code=500)
