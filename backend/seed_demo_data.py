from __future__ import annotations

import json
from datetime import date, datetime, timedelta

from app import create_app, db
from app.models import (
    AIChatHistory,
    AIWorkoutPlan,
    DietPlan,
    ExerciseEmbedding,
    FitnessProfile,
    MealPlan,
    MLPrediction,
    ProgressLog,
    User,
    WeightLog,
    Workout,
)
from app.services.ml_service import MLService
from app.utils.seed_exercises import seed_database_exercises


DEMO_USER_EMAIL = "demo@fitnova.local"


def _serialize(value):
    return json.dumps(value, ensure_ascii=True)


def _seed_user():
    user = User.query.filter_by(email=DEMO_USER_EMAIL).first()
    if user:
        return user, False

    user = User(
        name="Demo Athlete",
        email=DEMO_USER_EMAIL,
        age=29,
        gender="Male",
        height=178.0,
        weight=78.4,
        fitness_goal="Muscle Gain",
        is_onboarded=True,
        created_at=datetime.utcnow() - timedelta(days=45),
    )
    user.set_password("DemoPass123!")
    db.session.add(user)
    db.session.flush()
    return user, True


def _seed_fitness_profile(user_id: int):
    profile = FitnessProfile.query.filter_by(user_id=user_id).first()
    if profile:
        return profile

    profile = FitnessProfile(
        user_id=user_id,
        fitness_goal="Muscle Gain",
        experience_level="Intermediate",
        workout_preference="Gym",
        available_days=5,
        equipment_access="Barbell,Dumbbells,Bench,Cable Machine,Pull-up Bar",
        injuries="None",
    )
    db.session.add(profile)
    return profile


def _seed_workouts(user_id: int):
    if Workout.query.filter_by(user_id=user_id).count() > 0:
        return

    sessions = [
        ("Push Day", "Barbell Bench Press", 4, 8, 320, 62),
        ("Push Day", "Incline Dumbbell Press", 4, 10, 280, 55),
        ("Push Day", "Lateral Raises", 3, 15, 120, 18),
        ("Pull Day", "Lat Pulldown", 4, 10, 260, 50),
        ("Pull Day", "Barbell Rows", 4, 8, 300, 58),
        ("Pull Day", "Barbell Curls", 3, 12, 110, 16),
        ("Leg Day", "Barbell Squats", 5, 6, 410, 68),
        ("Leg Day", "Romanian Deadlift", 4, 8, 290, 52),
        ("Leg Day", "Walking Lunges", 3, 14, 180, 24),
        ("Upper Body", "Overhead Press", 4, 8, 230, 42),
        ("Upper Body", "Cable Flyes", 3, 12, 140, 20),
        ("Core + Conditioning", "Plank Hold", 4, 45, 90, 15),
        ("Core + Conditioning", "Hanging Leg Raises", 4, 12, 130, 18),
        ("Full Body", "Deadlift", 5, 5, 450, 72),
        ("Full Body", "Pull-Ups", 4, 8, 220, 36),
    ]

    today = date.today()
    for offset, (workout_name, exercise_name, sets, reps, calories, duration) in enumerate(sessions):
        workout = Workout(
            user_id=user_id,
            workout_name=workout_name,
            exercise_name=exercise_name,
            sets=sets,
            reps=reps,
            calories_burned=calories,
            duration=duration,
            created_at=datetime.combine(today - timedelta(days=offset * 2), datetime.min.time()),
        )
        db.session.add(workout)


def _seed_weight_and_progress(user_id: int, start_weight: float):
    if WeightLog.query.filter_by(user_id=user_id).count() == 0:
        today = date.today()
        for idx in range(10):
            w = round(start_weight - (idx * 0.35), 1)
            log_date = today - timedelta(days=(9 - idx) * 7)
            db.session.add(
                WeightLog(
                    user_id=user_id,
                    weight=w,
                    date=log_date,
                    notes="Weekly weigh-in from morning check-in.",
                    created_at=datetime.combine(log_date, datetime.min.time()),
                )
            )

    if ProgressLog.query.filter_by(user_id=user_id).count() == 0:
        today = date.today()
        for idx in range(8):
            log_date = today - timedelta(days=(7 - idx) * 7)
            db.session.add(
                ProgressLog(
                    user_id=user_id,
                    date=log_date,
                    weight=round(start_weight - (idx * 0.4), 1),
                    body_fat=18.8 - (idx * 0.3),
                    muscle_mass=34.5 + (idx * 0.4),
                    chest=101.0 + (idx * 0.4),
                    waist=86.0 - (idx * 0.5),
                    biceps=35.2 + (idx * 0.15),
                    thighs=58.0 + (idx * 0.2),
                    notes="Progress photo and measurements captured after training.",
                    created_at=datetime.combine(log_date, datetime.min.time()),
                )
            )


def _seed_plans(user_id: int):
    if AIWorkoutPlan.query.filter_by(user_id=user_id).count() == 0:
        plan_data = {
            "Monday": [
                {"exercise": "Barbell Bench Press", "sets": 4, "reps": "6-8"},
                {"exercise": "Incline Dumbbell Press", "sets": 4, "reps": "8-10"},
                {"exercise": "Lateral Raises", "sets": 3, "reps": "12-15"},
            ],
            "Wednesday": [
                {"exercise": "Lat Pulldown", "sets": 4, "reps": "8-10"},
                {"exercise": "Barbell Rows", "sets": 4, "reps": "6-8"},
                {"exercise": "Barbell Curls", "sets": 3, "reps": "10-12"},
            ],
            "Friday": [
                {"exercise": "Barbell Squats", "sets": 5, "reps": "5-6"},
                {"exercise": "Romanian Deadlift", "sets": 4, "reps": "6-8"},
                {"exercise": "Walking Lunges", "sets": 3, "reps": "12-14"},
            ],
        }
        db.session.add(
            AIWorkoutPlan(
                user_id=user_id,
                plan_name="Lean Mass Builder",
                goal="Muscle Gain",
                difficulty="Intermediate",
                duration_weeks=8,
                sessions_per_week=5,
                equipment_needed="Barbell, Dumbbells, Cable Machine, Bench",
                plan_data=_serialize(plan_data),
                rationale="Built around compound lifts with targeted accessory work to support hypertrophy.",
                progression_notes="Increase load by 2.5-5% when all target reps are achieved with solid form.",
            )
        )

    if DietPlan.query.filter_by(user_id=user_id).count() == 0:
        db.session.add(
            DietPlan(
                user_id=user_id,
                target_calories=2850,
                protein="185g",
                carbs="320g",
                fats="80g",
                meals={
                    "breakfast": ["Oats", "Greek yogurt", "Banana", "Peanut butter"],
                    "lunch": ["Chicken breast", "Rice", "Mixed vegetables"],
                    "dinner": ["Salmon", "Sweet potato", "Salad"],
                },
                hydration="3.5L water daily",
                tips=["Eat 25-40g protein per meal", "Prioritize carbs around training", "Keep a weekly weigh-in"],
            )
        )

    if MealPlan.query.filter_by(user_id=user_id).count() == 0:
        db.session.add(
            MealPlan(
                user_id=user_id,
                calorie_target=2850,
                diet_type="Non-Veg",
                breakfast="Overnight oats with Greek yogurt, berries, and peanut butter",
                lunch="Grilled chicken rice bowl with vegetables and olive oil",
                dinner="Salmon, sweet potato, and asparagus",
                snacks="Protein shake, almonds, banana",
                proteins="185g",
                carbs="320g",
                fats="80g",
                meal_timing="Breakfast 8:00 AM, lunch 1:00 PM, dinner 8:00 PM, snacks around workouts",
            )
        )

    if AIChatHistory.query.filter_by(user_id=user_id).count() == 0:
        db.session.add(
            AIChatHistory(
                user_id=user_id,
                sender="user",
                message="I want to gain lean muscle without getting too bulky.",
            )
        )
        db.session.add(
            AIChatHistory(
                user_id=user_id,
                sender="coach",
                message="That’s a great target. We’ll keep protein high, train compounds hard, and use a steady surplus.",
            )
        )


def _seed_predictions(user_id: int):
    if MLPrediction.query.filter_by(user_id=user_id).count() > 0:
        return

    payloads = [
        (
            "weight",
            {"current_weight": 78.4, "trend_14": -0.2, "trend_30": -0.4, "goal": "gain", "activity_level": "moderate"},
            {"predicted_weight": 79.1, "confidence": 0.82},
        ),
        (
            "consistency",
            {"workout_frequency": 5, "missed_sessions": 1, "login_days": 23, "streak_days": 9, "session_duration": 58},
            {"dropout_risk": 0.18, "consistency_score": 0.86},
        ),
        (
            "recovery",
            {"sleep_hours": 7.4, "workout_duration": 62, "workout_intensity": 7, "muscle_soreness": 4, "calories_burned": 320},
            {"recovery_score": 0.74, "recommendation": "Light mobility or rest"},
        ),
        (
            "progressive_overload",
            {"prev_weight": 80, "reps_completed": 8, "sets_completed": 4, "exercise_trend": 0.22},
            {"next_weight": 82.5, "target_reps": 8},
        ),
    ]

    for prediction_type, input_data, output_data in payloads:
        db.session.add(
            MLPrediction(
                user_id=user_id,
                prediction_type=prediction_type,
                input_data=_serialize(input_data),
                output_data=_serialize(output_data),
            )
        )


def _ensure_exercises():
    if ExerciseEmbedding.query.count() == 0:
        seed_database_exercises()


def seed_demo_data():
    app = create_app()
    with app.app_context():
        print("[Fitnova Seed] Seeding demo data...")
        _ensure_exercises()

        user, created = _seed_user()
        _seed_fitness_profile(user.id)
        _seed_workouts(user.id)
        _seed_weight_and_progress(user.id, user.weight or 78.4)
        _seed_plans(user.id)
        _seed_predictions(user.id)

        db.session.commit()

        print(f"[Fitnova Seed] Demo user {'created' if created else 'already existed'}: {user.email}")
        print("[Fitnova Seed] Training ML models on the seeded data...")
        MLService.train_weight_model()
        MLService.train_consistency_model()
        MLService.train_recovery_model()
        MLService.train_overload_model()
        print("[Fitnova Seed] Demo data and model metrics are ready.")


if __name__ == "__main__":
    seed_demo_data()
