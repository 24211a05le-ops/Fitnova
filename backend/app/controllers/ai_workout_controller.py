import json
from flask import request
from flask_jwt_extended import get_jwt_identity
from app import db
from app.models.ai_workout_plan import AIWorkoutPlan
from app.models.user import User
from app.utils.responses import api_response, error_response

# Mock workout templates for AI simulation
TEMPLATES = {
    "Weight Loss": {
        "plan_name": "Fat Burn Accelerator",
        "rationale": "This plan combines high-intensity interval training with compound movements to maximize caloric expenditure. The circuit-style format keeps your heart rate elevated, promoting fat oxidation while preserving lean muscle mass.",
        "progression": "Week 1-2: Learn form, moderate intensity. Week 3-4: Increase weights by 5-10%. Add 1 extra set per exercise. Reduce rest periods by 10 seconds.",
        "days": [
            {"day": "Monday", "focus": "Full Body HIIT", "exercises": [
                {"name": "Burpees", "sets": 3, "reps": 15, "rest": "30s"},
                {"name": "Kettlebell Swings", "sets": 4, "reps": 20, "rest": "30s"},
                {"name": "Mountain Climbers", "sets": 3, "reps": 30, "rest": "20s"},
                {"name": "Dumbbell Thrusters", "sets": 3, "reps": 12, "rest": "45s"}
            ]},
            {"day": "Wednesday", "focus": "Upper Body + Cardio", "exercises": [
                {"name": "Push-Ups", "sets": 4, "reps": 15, "rest": "30s"},
                {"name": "Dumbbell Rows", "sets": 3, "reps": 12, "rest": "45s"},
                {"name": "Battle Ropes", "sets": 3, "reps": 30, "rest": "30s"},
                {"name": "Plank Hold", "sets": 3, "reps": "45s", "rest": "20s"}
            ]},
            {"day": "Friday", "focus": "Lower Body Burn", "exercises": [
                {"name": "Jump Squats", "sets": 4, "reps": 15, "rest": "30s"},
                {"name": "Walking Lunges", "sets": 3, "reps": 20, "rest": "30s"},
                {"name": "Box Jumps", "sets": 3, "reps": 12, "rest": "45s"},
                {"name": "Calf Raises", "sets": 4, "reps": 20, "rest": "20s"}
            ]}
        ]
    },
    "Muscle Gain": {
        "plan_name": "Hypertrophy Builder Pro",
        "rationale": "Progressive overload with moderate-to-heavy weights targeting each major muscle group twice weekly. The rep ranges (8-12) sit in the hypertrophy sweet spot, maximizing muscle protein synthesis while managing recovery demands.",
        "progression": "Week 1-2: Establish baseline weights. Week 3-4: Add 2.5-5kg to compound lifts, increase isolation volume by 1 set. Focus on mind-muscle connection.",
        "days": [
            {"day": "Monday", "focus": "Chest & Triceps", "exercises": [
                {"name": "Barbell Bench Press", "sets": 4, "reps": 10, "rest": "90s"},
                {"name": "Incline Dumbbell Press", "sets": 3, "reps": 12, "rest": "60s"},
                {"name": "Cable Flyes", "sets": 3, "reps": 15, "rest": "45s"},
                {"name": "Tricep Dips", "sets": 3, "reps": 12, "rest": "60s"}
            ]},
            {"day": "Wednesday", "focus": "Back & Biceps", "exercises": [
                {"name": "Deadlifts", "sets": 4, "reps": 8, "rest": "120s"},
                {"name": "Pull-Ups", "sets": 4, "reps": 10, "rest": "90s"},
                {"name": "Barbell Rows", "sets": 3, "reps": 12, "rest": "60s"},
                {"name": "Barbell Curls", "sets": 3, "reps": 12, "rest": "45s"}
            ]},
            {"day": "Friday", "focus": "Legs & Shoulders", "exercises": [
                {"name": "Barbell Squats", "sets": 4, "reps": 10, "rest": "120s"},
                {"name": "Leg Press", "sets": 3, "reps": 12, "rest": "90s"},
                {"name": "Overhead Press", "sets": 4, "reps": 10, "rest": "60s"},
                {"name": "Lateral Raises", "sets": 3, "reps": 15, "rest": "45s"}
            ]}
        ]
    }
}

def generate_ai_workout():
    """Generate a mock AI workout plan based on user preferences"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user:
            return error_response("User not found", status_code=404)

        data = request.get_json() or {}
        goal = data.get("goal", user.fitness_goal or "Muscle Gain")
        difficulty = data.get("difficulty", "Intermediate")
        days_per_week = data.get("daysPerWeek", 3)
        equipment = data.get("equipment", "Full Gym")
        time_per_session = data.get("timePerSession", 45)

        # Select template based on goal
        template = TEMPLATES.get(goal, TEMPLATES["Muscle Gain"])
        plan_days = template["days"][:days_per_week] if days_per_week < len(template["days"]) else template["days"]

        plan = AIWorkoutPlan(
            user_id=int(user_id),
            plan_name=template["plan_name"],
            goal=goal,
            difficulty=difficulty,
            duration_weeks=4,
            sessions_per_week=days_per_week,
            equipment_needed=equipment,
            plan_data=json.dumps(plan_days),
            rationale=template["rationale"],
            progression_notes=template["progression"]
        )
        db.session.add(plan)
        db.session.commit()

        return api_response(success=True, message="AI workout plan generated", data=plan.to_dict(), status_code=201)
    except Exception as e:
        db.session.rollback()
        return error_response(f"Could not generate plan: {str(e)}", status_code=500)

def get_ai_workout_plans():
    """Get all AI workout plans for user"""
    try:
        user_id = get_jwt_identity()
        plans = AIWorkoutPlan.query.filter_by(user_id=int(user_id)).order_by(AIWorkoutPlan.created_at.desc()).all()
        return api_response(success=True, message=f"{len(plans)} plan(s)", data={"plans": [p.to_dict() for p in plans]})
    except Exception as e:
        return error_response(f"Could not fetch plans: {str(e)}", status_code=500)

def get_dashboard_widgets():
    """Return mock dashboard widget data for fitness overview"""
    try:
        user_id = get_jwt_identity()
        data = {
            "calories_burned": {"today": 487, "goal": 600, "week_total": 3240},
            "workout_streak": {"current": 5, "best": 12, "unit": "days"},
            "weekly_consistency": {"completed": 4, "planned": 5, "percentage": 80},
            "goal_progress": {"current": 68, "target": 100, "label": "On Track"},
            "recovery_status": {"score": 84, "label": "Fully Recovered", "color": "green"},
            "muscle_groups_trained": ["Chest", "Back", "Shoulders", "Core"]
        }
        return api_response(success=True, message="Dashboard widgets", data=data)
    except Exception as e:
        return error_response(f"Error: {str(e)}", status_code=500)
