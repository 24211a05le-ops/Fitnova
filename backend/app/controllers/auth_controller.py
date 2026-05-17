import re
from flask import request
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.utils.responses import api_response, error_response

# Basic regex for email syntax validation
EMAIL_REGEX = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

def register_user():
    """Handles User Registration POST request"""
    try:
        data = request.get_json()
        if not data:
            return error_response("Request payload is empty or not JSON format", status_code=400)

        # Enforce required parameters validation
        required_fields = ["name", "email", "password"]
        for field in required_fields:
            if not data.get(field):
                return error_response(f"Field '{field}' is required and cannot be empty", status_code=400)

        name = data.get("name").strip()
        email = data.get("email").strip().lower()
        password = data.get("password")

        # 1. Validation for Email Structure
        if not re.match(EMAIL_REGEX, email):
            return error_response("Please provide a valid email format", status_code=400)

        # 2. Validation for Password Length
        if len(password) < 6:
            return error_response("Password must be at least 6 characters long", status_code=400)

        # 3. Validation for Email Duplication
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return error_response("An account with this email address already exists", status_code=409)

        # Create New User
        user = User(
            name=name,
            email=email,
            age=data.get("age"),
            gender=data.get("gender"),
            height=data.get("height"),
            weight=data.get("weight"),
            fitness_goal=data.get("fitnessGoal") or data.get("fitness_goal")
        )
        
        # Set hashed password
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()

        # Generate JWT Session Access Token
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))

        response_data = {
            "token": access_token,
            "refresh_token": refresh_token,
            "user": user.to_dict()
        }
        return api_response(success=True, message="User profile registered successfully", data=response_data, status_code=201)

    except Exception as e:
        db.session.rollback()
        return error_response(f"An unexpected error occurred during registration: {str(e)}", status_code=500)

def login_user():
    """Handles User Login POST request"""
    try:
        data = request.get_json()
        if not data or not data.get("email") or not data.get("password"):
            return error_response("Email and Password are required", status_code=400)

        email = data.get("email").strip().lower()
        password = data.get("password")

        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            return error_response("Invalid email address or password. Please try again.", status_code=401)

        # Generate JWT Session Access Token
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))

        response_data = {
            "token": access_token,
            "refresh_token": refresh_token,
            "user": user.to_dict()
        }
        return api_response(success=True, message="Authentication successful", data=response_data)

    except Exception as e:
        return error_response(f"An unexpected error occurred during login: {str(e)}", status_code=500)

def verify_session():
    """Verifies the JWT token and returns current user data"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user:
            return error_response("User profile not found", status_code=404)
        
        return api_response(success=True, message="Session valid", data={"user": user.to_dict()})
    except Exception as e:
        return error_response("Session invalid or expired", status_code=401)

def refresh_session():
    """Generates a new access token from a refresh token"""
    try:
        user_id = get_jwt_identity()
        new_token = create_access_token(identity=str(user_id))
        return api_response(success=True, message="Token refreshed", data={"token": new_token})
    except Exception as e:
        return error_response("Invalid refresh token", status_code=401)

def logout_user():
    """Placeholder endpoint for invalidating session token"""
    return api_response(success=True, message="Logged out successfully. Please discard the JWT token client-side.")
