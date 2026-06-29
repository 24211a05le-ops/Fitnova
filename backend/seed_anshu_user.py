from __future__ import annotations

import json
from datetime import date, datetime, time, timedelta

from app import create_app, db
from app.models import (
    AIChatHistory,
    AIWorkoutPlan,
    DietPlan,
    FitnessProfile,
    MealPlan,
    MLPrediction,
    ProgressLog,
    User,
    WeightLog,
    Workout,
)
from app.services.insight_service import InsightService
from app.services.ml_service import MLService


USER_EMAIL = "anshu123@gmail.com"
USER_PASSWORD = "anshu123"
WORKOUT_DAY_COUNT = 50

WEIGHT_SERIES = [54.6, 54.8, 55.0, 55.2, 55.4, 55.7, 55.9, 56.1, 56.4, 56.6, 56.9, 57.2]

PROGRESS_SERIES = [
    {"weight": 54.7, "body_fat": 24.8, "muscle_mass": 20.8, "chest": 83.6, "waist": 73.4, "biceps": 27.1, "thighs": 48.8},
    {"weight": 55.0, "body_fat": 24.3, "muscle_mass": 21.1, "chest": 84.0, "waist": 73.0, "biceps": 27.4, "thighs": 49.1},
    {"weight": 55.3, "body_fat": 23.9, "muscle_mass": 21.4, "chest": 84.4, "waist": 72.7, "biceps": 27.8, "thighs": 49.5},
    {"weight": 55.7, "body_fat": 23.5, "muscle_mass": 21.8, "chest": 84.9, "waist": 72.3, "biceps": 28.1, "thighs": 49.8},
    {"weight": 56.0, "body_fat": 23.1, "muscle_mass": 22.0, "chest": 85.3, "waist": 71.9, "biceps": 28.4, "thighs": 50.2},
    {"weight": 56.4, "body_fat": 22.7, "muscle_mass": 22.3, "chest": 85.8, "waist": 71.6, "biceps": 28.7, "thighs": 50.7},
    {"weight": 56.8, "body_fat": 22.3, "muscle_mass": 22.6, "chest": 86.2, "waist": 71.2, "biceps": 29.0, "thighs": 51.1},
    {"weight": 57.1, "body_fat": 21.9, "muscle_mass": 22.9, "chest": 86.6, "waist": 70.9, "biceps": 29.3, "thighs": 51.5},
]

WORKOUT_TEMPLATES = [
    {
        "name": "Push Strength",
        "duration": 62,
        "calories": 430,
        "exercises": [
            {"name": "Barbell Bench Press", "sets": 4, "reps": 8},
            {"name": "Incline Dumbbell Press", "sets": 4, "reps": 10},
            {"name": "Overhead Press", "sets": 3, "reps": 8},
            {"name": "Tricep Pushdowns", "sets": 3, "reps": 12},
        ],
    },
    {
        "name": "Lower Body Power",
        "duration": 68,
        "calories": 470,
        "exercises": [
            {"name": "Barbell Squats", "sets": 4, "reps": 6},
            {"name": "Romanian Deadlift", "sets": 4, "reps": 8},
            {"name": "Walking Lunges", "sets": 3, "reps": 12},
            {"name": "Plank Hold", "sets": 3, "reps": 45},
        ],
    },
    {
        "name": "Pull Strength",
        "duration": 60,
        "calories": 410,
        "exercises": [
            {"name": "Lat Pulldown", "sets": 4, "reps": 10},
            {"name": "Barbell Rows", "sets": 4, "reps": 8},
            {"name": "Pull-Ups", "sets": 3, "reps": 8},
            {"name": "Barbell Curls", "sets": 3, "reps": 12},
        ],
    },
    {
        "name": "Upper Hypertrophy",
        "duration": 58,
        "calories": 395,
        "exercises": [
            {"name": "Cable Flyes", "sets": 3, "reps": 12},
            {"name": "Lateral Raises", "sets": 3, "reps": 15},
            {"name": "Face Pulls", "sets": 3, "reps": 14},
            {"name": "Hammer Curls", "sets": 3, "reps": 12},
        ],
    },
    {
        "name": "Conditioning Core",
        "duration": 52,
        "calories": 360,
        "exercises": [
            {"name": "Push-Ups", "sets": 4, "reps": 15},
            {"name": "Walking Lunges", "sets": 3, "reps": 14},
            {"name": "Hanging Leg Raises", "sets": 3, "reps": 12},
            {"name": "Cable Crunches", "sets": 3, "reps": 15},
        ],
    },
    {
        "name": "Full Body Builder",
        "duration": 64,
        "calories": 445,
        "exercises": [
            {"name": "Deadlift", "sets": 4, "reps": 5},
            {"name": "Incline Dumbbell Press", "sets": 3, "reps": 10},
            {"name": "Pull-Ups", "sets": 3, "reps": 8},
            {"name": "Leg Press", "sets": 3, "reps": 12},
        ],
    },
]


def serialize(value):
    return json.dumps(value, ensure_ascii=True)


def split_total(total, parts):
    base = total // parts
    remainder = total % parts
    return [base + (1 if index < remainder else 0) for index in range(parts)]


def build_workout_dates(total_days=WORKOUT_DAY_COUNT):
    today = date.today()
    selected = {today - timedelta(days=offset) for offset in range(7)}
    cursor = today - timedelta(days=7)

    while len(selected) < total_days:
        if cursor.weekday() in {0, 1, 3, 4, 5}:
            selected.add(cursor)
        cursor -= timedelta(days=1)

    return sorted(selected)


def clear_user_data(user_id):
    for model in (
        Workout,
        ProgressLog,
        WeightLog,
        DietPlan,
        MealPlan,
        AIWorkoutPlan,
        AIChatHistory,
        MLPrediction,
        FitnessProfile,
    ):
        model.query.filter_by(user_id=user_id).delete(synchronize_session=False)
    db.session.flush()


def ensure_user():
    user = User.query.filter_by(email=USER_EMAIL).first()
    created = False
    workout_dates = build_workout_dates()

    if not user:
        user = User(email=USER_EMAIL)
        db.session.add(user)
        created = True

    user.name = "Anshu Vegiraju"
    user.email = USER_EMAIL
    user.age = 23
    user.gender = "Male"
    user.height = 156.0
    user.weight = WEIGHT_SERIES[-1]
    user.fitness_goal = "Muscle Gain"
    user.is_onboarded = True
    user.created_at = datetime.combine(workout_dates[0] - timedelta(days=18), time(hour=8, minute=0))
    user.set_password(USER_PASSWORD)

    db.session.flush()
    return user, created


def seed_fitness_profile(user_id):
    profile = FitnessProfile(
        user_id=user_id,
        fitness_goal="Muscle Gain",
        experience_level="Intermediate",
        workout_preference="Gym",
        available_days=5,
        equipment_access="Barbell,Dumbbells,Bench,Cable Machine,Pull-up Bar,Resistance Bands",
        injuries="None",
    )
    db.session.add(profile)


def seed_workouts(user_id):
    workout_dates = build_workout_dates()
    sessions = []

    for session_index, workout_day in enumerate(workout_dates):
        template = WORKOUT_TEMPLATES[session_index % len(WORKOUT_TEMPLATES)]
        progression_block = session_index // len(WORKOUT_TEMPLATES)
        total_duration = template["duration"] + min(progression_block, 4) * 2
        total_calories = template["calories"] + min(progression_block, 4) * 18 + (12 if workout_day.weekday() >= 5 else 0)
        duration_parts = split_total(total_duration, len(template["exercises"]))
        calorie_parts = split_total(total_calories, len(template["exercises"]))
        session_time = datetime.combine(
            workout_day,
            time(hour=6 + (session_index % 5), minute=(session_index * 11) % 60),
        )

        session_snapshot = {
            "name": template["name"],
            "date": workout_day,
            "created_at": session_time,
            "duration": total_duration,
            "calories": total_calories,
        }
        sessions.append(session_snapshot)

        for exercise_index, exercise in enumerate(template["exercises"]):
            extra_set = 1 if progression_block >= 4 and exercise_index == 0 else 0
            extra_rep = 1 if progression_block >= 2 and exercise["reps"] <= 10 else 0

            db.session.add(
                Workout(
                    user_id=user_id,
                    workout_name=template["name"],
                    exercise_name=exercise["name"],
                    sets=exercise["sets"] + extra_set,
                    reps=exercise["reps"] + extra_rep,
                    calories_burned=calorie_parts[exercise_index],
                    duration=duration_parts[exercise_index],
                    created_at=session_time,
                )
            )

    return sessions


def seed_weight_logs(user_id):
    entries = []
    start_day = date.today() - timedelta(days=66)

    for index, weight in enumerate(WEIGHT_SERIES):
        log_date = start_day + timedelta(days=index * 6)
        entries.append((log_date, weight))
        db.session.add(
            WeightLog(
                user_id=user_id,
                weight=weight,
                date=log_date,
                notes="Weekly morning check-in after hydration.",
                created_at=datetime.combine(log_date, time(hour=6, minute=30)),
            )
        )

    return entries


def seed_progress_logs(user_id):
    start_day = date.today() - timedelta(days=63)

    for index, metrics in enumerate(PROGRESS_SERIES):
        log_date = start_day + timedelta(days=index * 9)
        db.session.add(
            ProgressLog(
                user_id=user_id,
                date=log_date,
                weight=metrics["weight"],
                body_fat=metrics["body_fat"],
                muscle_mass=metrics["muscle_mass"],
                chest=metrics["chest"],
                waist=metrics["waist"],
                biceps=metrics["biceps"],
                thighs=metrics["thighs"],
                notes="Strength phase review with tape measurements and recovery notes.",
                created_at=datetime.combine(log_date, time(hour=7, minute=15)),
            )
        )


def seed_nutrition(user_id):
    db.session.add(
        DietPlan(
            user_id=user_id,
            target_calories=2250,
            protein="132g",
            carbs="255g",
            fats="66g",
            meals={
                "breakfast": ["Oats with milk", "Greek yogurt", "Banana", "Peanut butter"],
                "lunch": ["Paneer rice bowl", "Mixed vegetables", "Curd"],
                "dinner": ["Dal", "Chapati", "Tofu stir fry", "Salad"],
            },
            hydration="3L water daily",
            tips=[
                "Eat protein in every meal to support lean muscle gain.",
                "Use fruit or curd pre-workout for steady energy.",
                "Keep one weekly weigh-in under similar conditions.",
            ],
        )
    )

    db.session.add(
        MealPlan(
            user_id=user_id,
            calorie_target=2250,
            diet_type="Vegetarian",
            breakfast="Overnight oats with chia seeds, Greek yogurt, banana, and almonds",
            lunch="Paneer and rice bowl with beans, cucumber salad, and curd",
            dinner="Dal, tofu stir fry, two chapatis, and sauteed vegetables",
            snacks="Protein smoothie, roasted chana, fruit, and peanut butter toast",
            proteins="132g",
            carbs="255g",
            fats="66g",
            meal_timing="Breakfast 8:00 AM, lunch 1:00 PM, snack 5:00 PM, dinner 8:30 PM",
        )
    )


def seed_ai_artifacts(user_id):
    plan_data = {
        "goal": "Muscle Gain",
        "weekly_split": {
            "Monday": "Push Strength",
            "Tuesday": "Lower Body Power",
            "Thursday": "Pull Strength",
            "Friday": "Upper Hypertrophy",
            "Saturday": "Conditioning Core",
        },
        "exercises": {
            "Monday": ["Barbell Bench Press", "Incline Dumbbell Press", "Overhead Press", "Tricep Pushdowns"],
            "Tuesday": ["Barbell Squats", "Romanian Deadlift", "Walking Lunges", "Plank Hold"],
            "Thursday": ["Lat Pulldown", "Barbell Rows", "Pull-Ups", "Barbell Curls"],
            "Friday": ["Cable Flyes", "Lateral Raises", "Face Pulls", "Hammer Curls"],
            "Saturday": ["Push-Ups", "Walking Lunges", "Hanging Leg Raises", "Cable Crunches"],
        },
        "sets": {
            "Barbell Bench Press": 4,
            "Incline Dumbbell Press": 4,
            "Overhead Press": 3,
            "Tricep Pushdowns": 3,
            "Barbell Squats": 4,
            "Romanian Deadlift": 4,
            "Walking Lunges": 3,
            "Plank Hold": 3,
            "Lat Pulldown": 4,
            "Barbell Rows": 4,
            "Pull-Ups": 3,
            "Barbell Curls": 3,
            "Cable Flyes": 3,
            "Lateral Raises": 3,
            "Face Pulls": 3,
            "Hammer Curls": 3,
            "Push-Ups": 4,
            "Hanging Leg Raises": 3,
            "Cable Crunches": 3,
        },
        "reps": {
            "Barbell Bench Press": 8,
            "Incline Dumbbell Press": 10,
            "Overhead Press": 8,
            "Tricep Pushdowns": 12,
            "Barbell Squats": 6,
            "Romanian Deadlift": 8,
            "Walking Lunges": 12,
            "Plank Hold": 45,
            "Lat Pulldown": 10,
            "Barbell Rows": 8,
            "Pull-Ups": 8,
            "Barbell Curls": 12,
            "Cable Flyes": 12,
            "Lateral Raises": 15,
            "Face Pulls": 14,
            "Hammer Curls": 12,
            "Push-Ups": 15,
            "Hanging Leg Raises": 12,
            "Cable Crunches": 15,
        },
        "rest_time": {
            "Barbell Bench Press": "90s",
            "Incline Dumbbell Press": "75s",
            "Overhead Press": "90s",
            "Tricep Pushdowns": "60s",
            "Barbell Squats": "120s",
            "Romanian Deadlift": "90s",
            "Walking Lunges": "60s",
            "Plank Hold": "45s",
            "Lat Pulldown": "75s",
            "Barbell Rows": "90s",
            "Pull-Ups": "75s",
            "Barbell Curls": "60s",
            "Cable Flyes": "60s",
            "Lateral Raises": "45s",
            "Face Pulls": "45s",
            "Hammer Curls": "45s",
            "Push-Ups": "45s",
            "Hanging Leg Raises": "60s",
            "Cable Crunches": "45s",
        },
        "progression_strategy": "Add 2.5kg to compound lifts once all sets feel clean, and aim for one extra rep on accessories every 1 to 2 weeks.",
        "cardio_plan": "Use two 12-minute incline walks after lifting for recovery and conditioning.",
    }

    db.session.add(
        AIWorkoutPlan(
            user_id=user_id,
            plan_name="Anshu Lean Muscle Builder",
            goal="Muscle Gain",
            difficulty="Intermediate",
            duration_weeks=10,
            sessions_per_week=5,
            equipment_needed="Barbell, Dumbbells, Bench, Cable Machine, Pull-up Bar",
            plan_data=serialize(plan_data),
            rationale="Built around steady strength progress, balanced recovery, and enough weekly volume to support lean muscle gain.",
            progression_notes=plan_data["progression_strategy"],
            created_at=datetime.utcnow() - timedelta(days=4),
        )
    )

    chat_messages = [
        ("user", "I want to gain lean muscle while keeping my energy high during the week.", 3),
        ("coach", "Perfect. We will prioritize progressive overload, consistent meals, and a repeatable five-day split.", 3),
        ("user", "Can we keep cardio short so it does not affect recovery?", 2),
        ("coach", "Yes. Short incline walks after lifting are enough to support conditioning without reducing your lifting output.", 2),
    ]

    for sender, message, days_ago in chat_messages:
        db.session.add(
            AIChatHistory(
                user_id=user_id,
                sender=sender,
                message=message,
                created_at=datetime.utcnow() - timedelta(days=days_ago),
            )
        )


def calculate_trend(weight_entries, days):
    latest_date, latest_weight = weight_entries[-1]
    reference_weight = weight_entries[0][1]

    for entry_date, entry_weight in reversed(weight_entries[:-1]):
        if (latest_date - entry_date).days >= days:
            reference_weight = entry_weight
            break

    return round(latest_weight - reference_weight, 2)


def build_session_payloads(sessions, target_day):
    return [
        {"created_at": session["created_at"].isoformat()}
        for session in sessions
        if session["date"] <= target_day
    ]


def safe_weight_prediction(current_weight, trend_14, trend_30):
    try:
        return MLService.predict_weight(
            current_weight=current_weight,
            trend_14=trend_14,
            trend_30=trend_30,
            goal="Muscle Gain",
            activity_level="active",
        )
    except Exception:
        return {
            "predicted_weight_2_weeks": round(current_weight + 0.25, 2),
            "predicted_weight_1_month": round(current_weight + 0.55, 2),
            "predicted_weight_3_months": round(current_weight + 1.35, 2),
            "predicted_7_days": round(current_weight + 0.12, 2),
            "predicted_30_days": round(current_weight + 0.55, 2),
            "predicted_90_days": round(current_weight + 1.35, 2),
        }


def safe_consistency_prediction(workout_frequency, missed_sessions, login_days, streak_days, session_duration):
    try:
        return MLService.predict_dropout_risk(
            workout_frequency=workout_frequency,
            missed_sessions=missed_sessions,
            login_days=login_days,
            streak_days=streak_days,
            session_duration=session_duration,
        )
    except Exception:
        consistency_probability = max(72.0, min(98.0, 86.0 + (streak_days * 0.8) - (missed_sessions * 2.5)))
        dropout_probability = round(100.0 - consistency_probability, 1)
        return {
            "consistency_probability": round(consistency_probability, 1),
            "dropout_probability": dropout_probability,
            "label": "Likely Consistent" if consistency_probability >= 85 else "At Mild Risk",
            "dropout_risk_score": dropout_probability,
        }


def safe_recovery_prediction(duration, calories, soreness):
    intensity = max(4, min(9, round((calories / max(duration, 1)) / 1.45)))

    try:
        return MLService.predict_recovery_score(
            sleep_hours=7.6,
            workout_duration=duration,
            workout_intensity=intensity,
            muscle_soreness=soreness,
            calories_burned=calories,
        )
    except Exception:
        score = max(55, min(92, round(86 - (intensity * 2.2) - (soreness * 1.4))))
        return {
            "recovery_score": score,
            "recovery_status": "High" if score >= 75 else "Moderate",
            "label": "Fully Recovered" if score >= 75 else "Moderately Recovered",
        }


def safe_overload_prediction(prev_weight, reps_completed, sets_completed, exercise_trend):
    try:
        return MLService.predict_progressive_overload(
            prev_weight=prev_weight,
            reps_completed=reps_completed,
            sets_completed=sets_completed,
            exercise_trend=exercise_trend,
        )
    except Exception:
        recommended_weight = round((prev_weight + 2.5) / 2.5) * 2.5
        return {
            "suggested_action": "Increase weight" if reps_completed >= 10 else "Keep same weight",
            "recommended_weight": recommended_weight,
            "recommended_reps": reps_completed,
            "recommended_sets": sets_completed,
            "rep_target": reps_completed,
        }


def seed_predictions(user_id, sessions, weight_entries):
    current_weight = weight_entries[-1][1]
    trend_14 = calculate_trend(weight_entries, 14)
    trend_30 = calculate_trend(weight_entries, 30)

    weight_prediction = safe_weight_prediction(current_weight, trend_14, trend_30)
    db.session.add(
        MLPrediction(
            user_id=user_id,
            prediction_type="weight",
            input_data=serialize(
                {
                    "current_weight": current_weight,
                    "trend_14": trend_14,
                    "trend_30": trend_30,
                    "goal": "Muscle Gain",
                    "activity_level": "active",
                }
            ),
            output_data=serialize(weight_prediction),
            created_at=datetime.utcnow() - timedelta(days=1),
        )
    )

    consistency_days = [12, 9, 6, 3, 1, 0]
    for offset in consistency_days:
        target_day = date.today() - timedelta(days=offset)
        recent_sessions = [session for session in sessions if 0 <= (target_day - session["date"]).days <= 6]
        workout_frequency = min(7, len(recent_sessions))
        missed_sessions = max(0, 5 - min(5, workout_frequency))
        streak_days = InsightService.calculate_streak(build_session_payloads(sessions, target_day), today=target_day)[0]
        avg_duration = round(
            sum(session["duration"] for session in recent_sessions) / max(len(recent_sessions), 1),
            1,
        ) if recent_sessions else 0.0
        login_days = min(30, max(10, workout_frequency * 4))

        output = safe_consistency_prediction(
            workout_frequency=workout_frequency,
            missed_sessions=missed_sessions,
            login_days=login_days,
            streak_days=streak_days,
            session_duration=avg_duration,
        )

        db.session.add(
            MLPrediction(
                user_id=user_id,
                prediction_type="consistency",
                input_data=serialize(
                    {
                        "workout_frequency": workout_frequency,
                        "missed_sessions": missed_sessions,
                        "login_days": login_days,
                        "streak_days": streak_days,
                        "session_duration": avg_duration,
                    }
                ),
                output_data=serialize(output),
                created_at=datetime.combine(target_day, time(hour=19, minute=0)),
            )
        )

    for session in sessions[-6:]:
        soreness = min(7, max(3, len(session["name"]) % 5 + 2))
        output = safe_recovery_prediction(
            duration=session["duration"],
            calories=session["calories"],
            soreness=soreness,
        )

        db.session.add(
            MLPrediction(
                user_id=user_id,
                prediction_type="recovery",
                input_data=serialize(
                    {
                        "sleep_hours": 7.6,
                        "workout_duration": session["duration"],
                        "workout_intensity": max(4, min(9, round((session["calories"] / max(session["duration"], 1)) / 1.45))),
                        "muscle_soreness": soreness,
                        "calories_burned": session["calories"],
                    }
                ),
                output_data=serialize(output),
                created_at=session["created_at"] + timedelta(hours=2),
            )
        )

    overload_inputs = [
        {"prev_weight": 30.0, "reps_completed": 10, "sets_completed": 4, "exercise_trend": 0.8},
        {"prev_weight": 55.0, "reps_completed": 8, "sets_completed": 4, "exercise_trend": 0.5},
        {"prev_weight": 65.0, "reps_completed": 9, "sets_completed": 4, "exercise_trend": 0.6},
    ]

    for index, payload in enumerate(overload_inputs):
        output = safe_overload_prediction(**payload)
        db.session.add(
            MLPrediction(
                user_id=user_id,
                prediction_type="progressive_overload",
                input_data=serialize(payload),
                output_data=serialize(output),
                created_at=datetime.utcnow() - timedelta(days=5 - index),
            )
        )


def seed_anshu_user():
    app = create_app()

    with app.app_context():
        print("[Fitnova Seed] Preparing Anshu user data...")
        db.create_all()
        InsightService.ensure_exercise_embeddings()

        user, created = ensure_user()
        clear_user_data(user.id)
        seed_fitness_profile(user.id)
        seeded_sessions = seed_workouts(user.id)
        weight_entries = seed_weight_logs(user.id)
        seed_progress_logs(user.id)
        seed_nutrition(user.id)
        seed_ai_artifacts(user.id)
        db.session.commit()

        seed_predictions(user.id, seeded_sessions, weight_entries)
        db.session.commit()

        print(f"[Fitnova Seed] User {'created' if created else 'updated'}: {user.email}")
        print(f"[Fitnova Seed] Password set to: {USER_PASSWORD}")
        print(f"[Fitnova Seed] Workout days seeded: {len(seeded_sessions)}")
        print("[Fitnova Seed] Related profile, progress, nutrition, AI, and prediction records are ready.")


if __name__ == "__main__":
    seed_anshu_user()
