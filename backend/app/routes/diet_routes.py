from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.responses import api_response, error_response
from app.services.ai_service import AIService
from app.models.meal_plan import MealPlan
from app import db

diet_bp = Blueprint('diet', __name__, url_prefix='/api/diet')

@diet_bp.route('/generate', methods=['POST'])
@jwt_required()
def generate_diet_plan():
    """
    Generates a personalized daily nutrition menu plan using OpenRouter AI.
    Saves the generated plan inside the PostgreSQL Neon database.
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}

        try:
            weight = float(data.get("weight", 75.0))
        except (ValueError, TypeError):
            weight = 75.0

        goal = data.get("fitnessGoal", "Weight Loss")
        preference = data.get("dietPreference", "High Protein")

        # 1. Determine Target Calories
        if goal == "Weight Loss":
            calories = int((weight * 22) - 400)
        elif goal == "Muscle Gain":
            calories = int((weight * 26) + 300)
        else:
            calories = int(weight * 24)

        # 2. Call OpenRouter AI
        ai_plan = AIService.generate_meal_plan(
            calories=calories,
            diet_type=preference,
            budget="Moderate",
            meals_per_day=4,
            allergies="None",
            indian_preference=True
        )

        # Save to database
        db_plan = MealPlan(
            user_id=int(user_id),
            calorie_target=calories,
            diet_type=preference,
            breakfast=ai_plan.get("breakfast", "High Protein Oatmeal"),
            lunch=ai_plan.get("lunch", "Grilled Chicken Breast with Rice"),
            dinner=ai_plan.get("dinner", "Baked Salmon with Quinoa"),
            snacks=ai_plan.get("snacks", "Greek Yogurt with Berries"),
            proteins=ai_plan.get("macros", {}).get("proteins", "150g"),
            carbs=ai_plan.get("macros", {}).get("carbs", "200g"),
            fats=ai_plan.get("macros", {}).get("fats", "60g"),
            meal_timing=ai_plan.get("meal_timing", "Eat meals spaced 3-4 hours apart.")
        )
        db.session.add(db_plan)
        db.session.commit()

        # Format for frontend
        meals = [
            {"name": "Breakfast", "time": "08:00 AM", "items": [db_plan.breakfast]},
            {"name": "Lunch", "time": "01:00 PM", "items": [db_plan.lunch]},
            {"name": "Snack", "time": "04:30 PM", "items": [db_plan.snacks]},
            {"name": "Dinner", "time": "08:30 PM", "items": [db_plan.dinner]}
        ]

        diet_data = {
            "calories": calories,
            "macros": {
                "protein": db_plan.proteins,
                "carbs": db_plan.carbs,
                "fats": db_plan.fats
            },
            "meals": meals,
            "tips": [
                db_plan.meal_timing,
                "Stay hydrated: Drink 500ml of water immediately upon waking.",
                "Squeeze lemon over green meals to increase non-heme iron absorption!"
            ]
        }

        return api_response(success=True, message="AI nutrition plan compiled successfully", data=diet_data)

    except Exception as e:
        db.session.rollback()
        return error_response(f"Could not generate nutrition plan: {str(e)}", status_code=500)

