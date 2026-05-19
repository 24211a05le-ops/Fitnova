import json
from flask import request
from flask_jwt_extended import get_jwt_identity
from app import db
from app.models.ai_chat_history import AIChatHistory
from app.models.ai_workout_plan import AIWorkoutPlan
from app.models.meal_plan import MealPlan
from app.models.exercise_embedding import ExerciseEmbedding
from app.models.user import User
from app.models.workout import Workout
from app.services.ai_service import AIService
from app.utils.responses import api_response, error_response

# Seed initial embeddings if empty
def _ensure_exercise_embeddings():
    if ExerciseEmbedding.query.count() == 0:
        presets = [
            {"name": "Barbell Bench Press", "muscle": "Chest", "tags": "chest, upper chest, bench press, incline, compound, push, bar", "diff": "Intermediate", "equip": "Gym"},
            {"name": "Push-Ups", "muscle": "Chest", "tags": "chest, bodyweight, push, home, beginner, chest burn", "diff": "Beginner", "equip": "Home"},
            {"name": "Dumbbell Flyes", "muscle": "Chest", "tags": "chest, isolation, dumbbell, outer chest", "diff": "Beginner", "equip": "Gym"},
            {"name": "Deadlift", "muscle": "Back", "tags": "back, lower back, compound, deadlift, pull, heavy", "diff": "Advanced", "equip": "Gym"},
            {"name": "Pull-Ups", "muscle": "Back", "tags": "back, lats, upper back, bodyweight, pull, bar", "diff": "Intermediate", "equip": "Home"},
            {"name": "Barbell Squats", "muscle": "Legs", "tags": "legs, quads, hamstrings, glutes, compound, squats, bar", "diff": "Intermediate", "equip": "Gym"},
            {"name": "Overhead Press", "muscle": "Shoulders", "tags": "shoulders, delts, overhead press, bar, military press", "diff": "Intermediate", "equip": "Gym"},
            {"name": "Barbell Curls", "muscle": "Arms", "tags": "arms, biceps, curls, isolation, bar", "diff": "Beginner", "equip": "Gym"},
            {"name": "Plank Hold", "muscle": "Core", "tags": "core, abs, plank, flat stomach, bodyweight", "diff": "Beginner", "equip": "Home"}
        ]
        for p in presets:
            emb = ExerciseEmbedding(
                exercise_name=p["name"],
                muscle_group=p["muscle"],
                tags=p["tags"],
                difficulty=p["diff"],
                equipment=p["equip"]
            )
            db.session.add(emb)
        db.session.commit()

def generate_workout():
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}
        
        goal = data.get("fitness_goal", "Muscle Gain")
        days = int(data.get("workout_days", 3))
        equipment = data.get("available_equipment", "Full Gym")
        level = data.get("difficulty_level", "Intermediate")
        duration = int(data.get("workout_duration", 45))
        injuries = data.get("injuries_limitations", "None")

        plan = AIService.generate_workout_plan(goal, days, equipment, level, duration, injuries)
        
        # Save to database
        db_plan = AIWorkoutPlan(
            user_id=int(user_id),
            plan_name=f"{level} {goal} ({days} Days)",
            goal=goal,
            difficulty=level,
            duration_weeks=4,
            sessions_per_week=days,
            equipment_needed=equipment,
            plan_data=json.dumps(plan.get("weekly_split", {})),
            rationale=plan.get("progression_strategy", "Focus on progression overload."),
            progression_notes=plan.get("cardio_plan", "Incorporate cardio cycles.")
        )
        db.session.add(db_plan)
        db.session.commit()

        return api_response(success=True, message="AI Workout Plan generated successfully", data=db_plan.to_dict(), status_code=201)
    except Exception as e:
        db.session.rollback()
        return error_response(f"Could not generate workout plan: {str(e)}", status_code=500)

def get_workout_plans():
    try:
        user_id = get_jwt_identity()
        plans = AIWorkoutPlan.query.filter_by(user_id=int(user_id)).order_by(AIWorkoutPlan.created_at.desc()).all()
        return api_response(success=True, message="Workout plans fetched", data={"plans": [p.to_dict() for p in plans]})
    except Exception as e:
        return error_response(f"Error fetching plans: {str(e)}", status_code=500)

def chat():
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}
        user_msg = data.get("message", "").strip()
        if not user_msg:
            return error_response("Message is required", status_code=400)

        # 1. Fetch chat history context (last 5 messages)
        history = AIChatHistory.query.filter_by(user_id=int(user_id)).order_by(AIChatHistory.created_at.desc()).limit(5).all()
        history_str = "\n".join([f"{h.sender.capitalize()}: {h.message}" for h in reversed(history)])

        # 2. Fetch recent workout context
        recent_workout = Workout.query.filter_by(user_id=int(user_id)).order_by(Workout.created_at.desc()).first()
        workout_str = f"Last Workout: {recent_workout.name} ({recent_workout.duration} mins)" if recent_workout else "No logged workouts."

        # 3. Call AI Coach
        reply = AIService.generate_fitness_chat(user_msg, history_str, workout_str)

        # 4. Save conversations
        db_user_msg = AIChatHistory(user_id=int(user_id), sender="user", message=user_msg)
        db_coach_msg = AIChatHistory(user_id=int(user_id), sender="coach", message=reply)
        db.session.add(db_user_msg)
        db.session.add(db_coach_msg)
        db.session.commit()

        return api_response(success=True, message="Reply generated", data={"reply": reply})
    except Exception as e:
        db.session.rollback()
        return error_response(f"Chat failed: {str(e)}", status_code=500)

def get_chat_history():
    try:
        user_id = get_jwt_identity()
        logs = AIChatHistory.query.filter_by(user_id=int(user_id)).order_by(AIChatHistory.created_at.asc()).all()
        return api_response(success=True, message="Chat history fetched", data={"history": [l.to_dict() for l in logs]})
    except Exception as e:
        return error_response(f"Error fetching history: {str(e)}", status_code=500)

def recovery_suggestions():
    try:
        data = request.get_json() or {}
        last_workout = data.get("last_workout", "Full Body")
        soreness = int(data.get("soreness", 3))
        sleep = float(data.get("sleep", 7.5))
        calories = int(data.get("calories", 2000))
        intensity = int(data.get("intensity", 5))

        advice = AIService.generate_recovery_advice(last_workout, soreness, sleep, calories, intensity)
        return api_response(success=True, message="Recovery analysis completed", data=advice)
    except Exception as e:
        return error_response(f"Recovery suggestions failed: {str(e)}", status_code=500)

def onboarding_analyzer():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user:
            return error_response("User not found", status_code=404)

        # Collate User onboarding data
        profile_data = {
            "name": user.name,
            "age": user.age,
            "height": user.height,
            "weight": user.weight,
            "fitness_goal": user.fitness_goal
        }
        if user.fitness_profile:
            profile_data.update({
                "experience_level": user.fitness_profile.experience_level,
                "workout_preference": user.fitness_profile.workout_preference,
                "available_days": user.fitness_profile.available_days,
                "equipment_access": user.fitness_profile.equipment_access,
                "injuries": user.fitness_profile.injuries
            })

        analysis = AIService.analyze_onboarding(profile_data)
        return api_response(success=True, message="Onboarding summary created", data=analysis)
    except Exception as e:
        return error_response(f"Onboarding analyzer failed: {str(e)}", status_code=500)

def diet_planner():
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}
        
        calories = int(data.get("calorie_target", 2000))
        diet_type = data.get("vegetarian_non_veg", "Vegetarian")
        budget = data.get("budget", "Moderate")
        meals = int(data.get("meals_per_day", 4))
        allergies = data.get("allergies", "None")
        indian = bool(data.get("indian_preference", True))

        plan = AIService.generate_meal_plan(calories, diet_type, budget, meals, allergies, indian)

        # Save to database
        db_plan = MealPlan(
            user_id=int(user_id),
            calorie_target=calories,
            diet_type=diet_type,
            breakfast=plan.get("breakfast"),
            lunch=plan.get("lunch"),
            dinner=plan.get("dinner"),
            snacks=plan.get("snacks"),
            proteins=plan.get("macros", {}).get("proteins", "150g"),
            carbs=plan.get("macros", {}).get("carbs", "200g"),
            fats=plan.get("macros", {}).get("fats", "60g"),
            meal_timing=plan.get("meal_timing", "Standard meal splits.")
        )
        db.session.add(db_plan)
        db.session.commit()

        return api_response(success=True, message="Meal plan generated successfully", data=db_plan.to_dict(), status_code=201)
    except Exception as e:
        db.session.rollback()
        return error_response(f"Could not generate meal plan: {str(e)}", status_code=500)

def get_meal_plans():
    try:
        user_id = get_jwt_identity()
        plans = MealPlan.query.filter_by(user_id=int(user_id)).order_by(MealPlan.created_at.desc()).all()
        return api_response(success=True, message="Meal plans fetched", data={"plans": [p.to_dict() for p in plans]})
    except Exception as e:
        return error_response(f"Error fetching meal plans: {str(e)}", status_code=500)

def exercise_smart_search():
    try:
        _ensure_exercise_embeddings()
        q = request.args.get("query", "").strip().lower()
        if not q:
            return api_response(success=True, message="Empty query", data={"results": []})

        # Match exercises based on tags/muscle/name synonym matching
        all_embeddings = ExerciseEmbedding.query.all()
        results = []
        for e in all_embeddings:
            # Direct match or semantic tag contains
            match_score = 0
            if q in e.exercise_name.lower():
                match_score += 10
            if q in e.muscle_group.lower():
                match_score += 5
            for tag in e.tags.split(","):
                if q in tag.strip().lower():
                    match_score += 3
            
            if match_score > 0:
                results.append((match_score, e.to_dict()))

        # Sort by best score matches
        results.sort(key=lambda x: x[0], reverse=True)
        sorted_results = [r[1] for r in results]

        return api_response(success=True, message=f"Found {len(sorted_results)} matching exercises", data={"results": sorted_results})
    except Exception as e:
        return error_response(f"Exercise search failed: {str(e)}", status_code=500)
