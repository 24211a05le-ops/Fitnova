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
from app.services.insight_service import InsightService
from app.utils.responses import api_response, error_response

def generate_workout():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        data = request.get_json() or {}
        
        goal = data.get("fitness_goal") or (user.fitness_goal if user else "Muscle Gain")
        
        days = data.get("workout_days")
        if days is not None:
            days = int(days)
        else:
            days = int(user.fitness_profile.available_days if user and user.fitness_profile and user.fitness_profile.available_days else 3)
            
        equipment = data.get("available_equipment") or (user.fitness_profile.equipment_access if user and user.fitness_profile else "Full Gym")
        level = data.get("difficulty_level") or (user.fitness_profile.experience_level if user and user.fitness_profile else "Intermediate")
        duration = int(data.get("workout_duration", 45))
        
        injuries = data.get("injuries_limitations")
        if (not injuries or injuries == "None") and user and user.fitness_profile:
            injuries = user.fitness_profile.injuries or "None"
        if not injuries:
            injuries = "None"

        # 1. Pull recent workout history and infer last muscle trained
        from app.models.workout import Workout
        from app.services.insight_service import InsightService
        from app.services.ml_service import MLService

        recent_workouts = Workout.query.filter_by(user_id=int(user_id)).order_by(Workout.created_at.desc()).limit(10).all()
        
        workout_history_str = "No recent workouts logged."
        last_trained_muscle = "None"
        
        if recent_workouts:
            catalog = InsightService.get_exercise_catalog()
            lookup = InsightService.build_exercise_lookup(catalog)
            last_trained_muscle = InsightService.infer_muscle_group(
                recent_workouts[0].exercise_name,
                recent_workouts[0].workout_name,
                lookup
            )
            workout_history_str = ", ".join([f"{w.exercise_name} ({w.sets}x{w.reps})" for w in recent_workouts])

        # 2. Compute Recovery Score using ML Model
        if recent_workouts:
            last_w = recent_workouts[0]
            w_dur = last_w.duration or 45
            cal_b = last_w.calories_burned or 250
            w_int = max(1.0, min(10.0, cal_b / max(w_dur, 1) / 1.4))
            sore = min(10.0, 2.0 + len(recent_workouts) * 1.2 + w_int * 0.3)
            rec_data = MLService.predict_recovery_score(
                sleep_hours=7.5,
                workout_duration=w_dur,
                workout_intensity=w_int,
                muscle_soreness=sore,
                calories_burned=cal_b
            )
            recovery_score = rec_data.get("recovery_score", 80)
        else:
            recovery_score = 80

        # 3. Compute Progressive Overload Recommendation using ML Model
        overload_rec_str = "None"
        if recent_workouts:
            heavy_w = max(recent_workouts, key=lambda w: (w.calories_burned or 0) / max(w.duration or 1, 1) + w.sets * 2.5)
            prev_w = float((heavy_w.calories_burned or 0) / max(heavy_w.duration or 1, 1) + heavy_w.sets * 2.5)
            overload_data = MLService.predict_progressive_overload(
                prev_weight=prev_w,
                reps_completed=heavy_w.reps or 8,
                sets_completed=heavy_w.sets or 3
            )
            if overload_data.get("suggested_action") == "Increase weight":
                overload_rec_str = f"Increase {heavy_w.exercise_name} load to {overload_data.get('recommended_weight')} kg (previously {prev_w:.1f} kg)."
            elif overload_data.get("suggested_action") == "Increase reps":
                overload_rec_str = f"Increase reps target for {heavy_w.exercise_name} to {overload_data.get('recommended_reps')} reps."

        # 4. Generate validated plan
        plan = AIService.generate_workout_plan(
            goal=goal,
            days=days,
            equipment=equipment,
            level=level,
            duration=duration,
            injuries=injuries,
            workout_history=workout_history_str,
            recovery_score=recovery_score,
            overload_rec=overload_rec_str
        )
        
        # Save to database
        db_plan = AIWorkoutPlan(
            user_id=int(user_id),
            plan_name=f"{level} {goal} ({days} Days)",
            goal=goal,
            difficulty=level,
            duration_weeks=4,
            sessions_per_week=days,
            equipment_needed=equipment,
            plan_data=json.dumps(plan),
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
        workout_str = f"Last Workout: {recent_workout.workout_name} ({recent_workout.duration} mins)" if recent_workout else "No logged workouts."

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
        InsightService.ensure_exercise_embeddings()
        q = request.args.get("query", "").strip().lower()
        all_embeddings = ExerciseEmbedding.query.order_by(
            ExerciseEmbedding.muscle_group.asc(),
            ExerciseEmbedding.exercise_name.asc()
        ).all()

        if not q:
            return api_response(
                success=True,
                message=f"Loaded {len(all_embeddings)} exercises",
                data={"results": [exercise.to_dict() for exercise in all_embeddings]},
            )

        # Match exercises based on tags/muscle/name synonym matching
        results = []
        for e in all_embeddings:
            # Direct match or semantic tag contains
            match_score = 0
            name_lower = (e.exercise_name or "").lower()
            muscle_lower = (e.muscle_group or "").lower()
            tags_str = e.tags or ""
            
            if q in name_lower:
                match_score += 10
            if q in muscle_lower:
                match_score += 5
            for tag in tags_str.split(","):
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

def get_dashboard_widgets():
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        if not user:
            return error_response("User not found", status_code=404)

        workouts = Workout.query.filter_by(user_id=user_id).order_by(Workout.created_at.desc()).all()
        sessions = InsightService.group_workout_sessions(workouts)
        weight_logs = user.weight_logs[:]
        weight_logs.sort(key=lambda log: log.date, reverse=True)
        exercise_catalog = InsightService.get_exercise_catalog()
        data = InsightService.build_dashboard_widgets(
            user=user,
            sessions=sessions,
            weight_logs=weight_logs,
            fitness_profile=user.fitness_profile,
            exercise_catalog=exercise_catalog,
        )
        return api_response(success=True, message="Dashboard widgets", data=data)
    except Exception as e:
        return error_response(f"Error: {str(e)}", status_code=500)
