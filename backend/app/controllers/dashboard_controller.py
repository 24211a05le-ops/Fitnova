from datetime import datetime, timedelta
from flask_jwt_extended import get_jwt_identity
from app import db
from app.models.workout import Workout
from app.models.progress_log import ProgressLog
from app.utils.responses import api_response, error_response

def get_dashboard_metrics():
    """Computes aggregate physical performance statistics for the user dashboard"""
    try:
        user_id = get_jwt_identity()

        # 1. Total Workouts Completed
        total_workouts = Workout.query.filter_by(user_id=user_id).count()

        # 2. Total Calories Burned Summation
        total_calories_burned = db.session.query(db.func.sum(Workout.calories_burned)).filter_by(user_id=user_id).scalar() or 0

        # 3. Latest Biometric Progress Checkpoint
        latest_progress_record = ProgressLog.query.filter_by(user_id=user_id).order_by(ProgressLog.created_at.desc()).first()
        latest_progress = latest_progress_record.to_dict() if latest_progress_record else {
            "weight": 75.0,
            "body_fat": 15.0,
            "muscle_mass": 35.0,
            "notes": "Initial benchmark placeholder. Please log your first physical check-in!"
        }

        # 4. Weekly Summary (Calculated counts & calories over last 7 days)
        today = datetime.utcnow().date()
        start_of_week = today - timedelta(days=6) # 7-day window
        
        weekly_workouts = Workout.query.filter(
            Workout.user_id == user_id,
            db.func.date(Workout.created_at) >= start_of_week
        ).all()

        # Map actual values to weekdays
        weekdays_map = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        weekly_counts = {day: 0 for day in weekdays_map}
        weekly_calories = {day: 0 for day in weekdays_map}

        for w in weekly_workouts:
            day_name = w.created_at.strftime("%a")
            if day_name in weekly_counts:
                weekly_counts[day_name] += 1
                weekly_calories[day_name] += w.calories_burned

        # If user has zero logged activities, supply a visual preview template
        if total_workouts == 0:
            weekly_counts = {"Mon": 1, "Tue": 0, "Wed": 1, "Thu": 1, "Fri": 0, "Sat": 1, "Sun": 0}
            weekly_calories = {"Mon": 450, "Tue": 0, "Wed": 500, "Thu": 600, "Fri": 0, "Sat": 450, "Sun": 0}

        # 5. Monthly Summary (Workouts and calories grouped by calendar weeks)
        start_of_month = today - timedelta(days=29) # 30-day window
        monthly_workouts = Workout.query.filter(
            Workout.user_id == user_id,
            db.func.date(Workout.created_at) >= start_of_month
        ).all()

        monthly_weeks_count = [0, 0, 0, 0] # 4 weeks
        monthly_weeks_calories = [0, 0, 0, 0]

        for w in monthly_workouts:
            days_ago = (today - w.created_at.date()).days
            week_idx = min(days_ago // 7, 3) # map to week index (0 to 3)
            # invert index so index 0 represents 4 weeks ago and index 3 is this week
            target_idx = 3 - week_idx
            monthly_weeks_count[target_idx] += 1
            monthly_weeks_calories[target_idx] += w.calories_burned

        if total_workouts == 0:
            monthly_weeks_count = [3, 4, 2, 4]
            monthly_weeks_calories = [1500, 1800, 1000, 2100]

        dashboard_data = {
            "total_workouts": total_workouts,
            "total_calories_burned": total_calories_burned,
            "latest_progress": latest_progress,
            "weekly_summary": {
                "labels": list(weekly_counts.keys()),
                "workout_counts": list(weekly_counts.values()),
                "calories_burned": list(weekly_calories.values())
            },
            "monthly_summary": {
                "labels": ["Week 1", "Week 2", "Week 3", "Week 4"],
                "workout_counts": monthly_weeks_count,
                "calories_burned": monthly_weeks_calories
            }
        }

        return api_response(success=True, message="Dashboard metrics compiled successfully", data=dashboard_data)

    except Exception as e:
        return error_response(f"Could not load dashboard statistics: {str(e)}", status_code=500)
