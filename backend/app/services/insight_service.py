import calendar
from collections import Counter, defaultdict
from datetime import datetime, timedelta

from app import db
from app.models.exercise_embedding import ExerciseEmbedding
from app.services.ml_service import MLService

MUSCLE_GROUPS = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"]

DEFAULT_EXERCISES = [
    # CHEST
    {"exercise_name": "Barbell Bench Press", "muscle_group": "Chest", "difficulty": "Intermediate", "equipment": "Gym", "tags": "chest, press, bench, push, triceps, power, strength"},
    {"exercise_name": "Incline Dumbbell Press", "muscle_group": "Chest", "difficulty": "Intermediate", "equipment": "Gym", "tags": "chest, incline, dumbbell, press, push, upper chest"},
    {"exercise_name": "Push-Ups", "muscle_group": "Chest", "difficulty": "Beginner", "equipment": "Home", "tags": "chest, bodyweight, floor, push, home, arms, triceps"},
    {"exercise_name": "Cable Flyes", "muscle_group": "Chest", "difficulty": "Intermediate", "equipment": "Gym", "tags": "chest, cable, fly, squeeze, inner chest, isolation"},
    {"exercise_name": "Incline Barbell Bench Press", "muscle_group": "Chest", "difficulty": "Intermediate", "equipment": "Gym", "tags": "chest, incline, barbell, press, push, upper chest"},
    {"exercise_name": "Decline Bench Press", "muscle_group": "Chest", "difficulty": "Intermediate", "equipment": "Gym", "tags": "chest, decline, press, bench, push, lower chest"},
    {"exercise_name": "Dumbbell Bench Press", "muscle_group": "Chest", "difficulty": "Intermediate", "equipment": "Gym", "tags": "chest, dumbbell, press, flat press, push"},
    {"exercise_name": "Pec Deck Fly", "muscle_group": "Chest", "difficulty": "Beginner", "equipment": "Gym", "tags": "chest, fly, machine, pec deck, isolation"},
    {"exercise_name": "Machine Chest Press", "muscle_group": "Chest", "difficulty": "Beginner", "equipment": "Gym", "tags": "chest, press, machine, push"},
    {"exercise_name": "Incline Cable Fly", "muscle_group": "Chest", "difficulty": "Intermediate", "equipment": "Gym", "tags": "chest, cable, fly, upper chest, incline"},
    {"exercise_name": "Decline Push-ups", "muscle_group": "Chest", "difficulty": "Beginner", "equipment": "Home", "tags": "chest, push-up, decline, bodyweight, lower chest"},
    {"exercise_name": "Chest Dips", "muscle_group": "Chest", "difficulty": "Advanced", "equipment": "Gym", "tags": "chest, dips, bodyweight, lower chest, push"},

    # BACK
    {"exercise_name": "Deadlift", "muscle_group": "Back", "difficulty": "Advanced", "equipment": "Gym", "tags": "back, deadlift, compound, lower back, hamstrings, legs, pull, power"},
    {"exercise_name": "Pull-Ups", "muscle_group": "Back", "difficulty": "Intermediate", "equipment": "Home", "tags": "back, pullup, lats, biceps, pull, bodyweight, upper back"},
    {"exercise_name": "Barbell Rows", "muscle_group": "Back", "difficulty": "Intermediate", "equipment": "Gym", "tags": "back, row, barbell, pull, lats, thickness, biceps"},
    {"exercise_name": "Lat Pulldown", "muscle_group": "Back", "difficulty": "Beginner", "equipment": "Gym", "tags": "back, lats, pulldown, cable, biceps, pull"},
    {"exercise_name": "Seated Cable Row", "muscle_group": "Back", "difficulty": "Beginner", "equipment": "Gym", "tags": "back, row, cable, seated, pull, thickness"},
    {"exercise_name": "T-Bar Row", "muscle_group": "Back", "difficulty": "Intermediate", "equipment": "Gym", "tags": "back, row, t-bar, compound, pull, thickness"},
    {"exercise_name": "Single Arm Dumbbell Row", "muscle_group": "Back", "difficulty": "Intermediate", "equipment": "Gym", "tags": "back, row, dumbbell, single arm, pull"},
    {"exercise_name": "Chest Supported Row", "muscle_group": "Back", "difficulty": "Beginner", "equipment": "Gym", "tags": "back, row, machine, chest supported, pull"},
    {"exercise_name": "Straight Arm Pulldown", "muscle_group": "Back", "difficulty": "Beginner", "equipment": "Gym", "tags": "back, pulldown, straight arm, lat isolation, pull"},
    {"exercise_name": "Face Pulls", "muscle_group": "Back", "difficulty": "Beginner", "equipment": "Gym", "tags": "back, shoulders, rear delts, cable, posture, pull"},
    {"exercise_name": "Machine Row", "muscle_group": "Back", "difficulty": "Beginner", "equipment": "Gym", "tags": "back, row, machine, pull"},
    {"exercise_name": "Wide Grip Pulldown", "muscle_group": "Back", "difficulty": "Beginner", "equipment": "Gym", "tags": "back, lats, pulldown, wide grip, pull"},
    {"exercise_name": "Close Grip Pulldown", "muscle_group": "Back", "difficulty": "Beginner", "equipment": "Gym", "tags": "back, lats, pulldown, close grip, pull"},

    # LEGS
    {"exercise_name": "Barbell Squats", "muscle_group": "Legs", "difficulty": "Intermediate", "equipment": "Gym", "tags": "legs, squat, barbell, quadriceps, glutes, compound, lower body"},
    {"exercise_name": "Leg Press", "muscle_group": "Legs", "difficulty": "Beginner", "equipment": "Gym", "tags": "legs, press, quadriceps, machine, lower body"},
    {"exercise_name": "Walking Lunges", "muscle_group": "Legs", "difficulty": "Beginner", "equipment": "Home", "tags": "legs, lunge, home, bodyweight, quadriceps, balance, glutes"},
    {"exercise_name": "Romanian Deadlift", "muscle_group": "Legs", "difficulty": "Intermediate", "equipment": "Gym", "tags": "legs, rdl, hamstring, glutes, lower back, barbell"},
    {"exercise_name": "Bulgarian Split Squat", "muscle_group": "Legs", "difficulty": "Intermediate", "equipment": "Gym", "tags": "legs, squat, dumbbell, bulgarian, glutes, quads"},
    {"exercise_name": "Leg Extension", "muscle_group": "Legs", "difficulty": "Beginner", "equipment": "Gym", "tags": "legs, quad, leg extension, machine, isolation"},
    {"exercise_name": "Leg Curl", "muscle_group": "Legs", "difficulty": "Beginner", "equipment": "Gym", "tags": "legs, hamstring, leg curl, machine, isolation"},
    {"exercise_name": "Goblet Squat", "muscle_group": "Legs", "difficulty": "Beginner", "equipment": "Home", "tags": "legs, squat, goblet, dumbbell, kettlebell"},
    {"exercise_name": "Hack Squat", "muscle_group": "Legs", "difficulty": "Intermediate", "equipment": "Gym", "tags": "legs, squat, hack squat, machine, quads"},
    {"exercise_name": "Hip Thrust", "muscle_group": "Legs", "difficulty": "Beginner", "equipment": "Gym", "tags": "legs, glutes, thrust, hip thrust, barbell"},
    {"exercise_name": "Step Ups", "muscle_group": "Legs", "difficulty": "Beginner", "equipment": "Home", "tags": "legs, step up, box, bodyweight, dumbbells"},
    {"exercise_name": "Calf Raises", "muscle_group": "Legs", "difficulty": "Beginner", "equipment": "Home", "tags": "legs, calves, calf raise, standing"},
    {"exercise_name": "Glute Bridge", "muscle_group": "Legs", "difficulty": "Beginner", "equipment": "Home", "tags": "legs, glutes, bridge, bodyweight"},
    {"exercise_name": "Sumo Squat", "muscle_group": "Legs", "difficulty": "Beginner", "equipment": "Gym", "tags": "legs, squat, sumo squat, glutes, adductors"},
    {"exercise_name": "Front Squat", "muscle_group": "Legs", "difficulty": "Advanced", "equipment": "Gym", "tags": "legs, squat, front squat, barbell, quads"},

    # SHOULDERS
    {"exercise_name": "Overhead Press", "muscle_group": "Shoulders", "difficulty": "Intermediate", "equipment": "Gym", "tags": "shoulders, ohp, press, deltoids, push, overhead, arms"},
    {"exercise_name": "Lateral Raises", "muscle_group": "Shoulders", "difficulty": "Beginner", "equipment": "Gym", "tags": "shoulders, lateral, raise, delts, side delts, dumbbell, isolation"},
    {"exercise_name": "Arnold Press", "muscle_group": "Shoulders", "difficulty": "Intermediate", "equipment": "Gym", "tags": "shoulders, press, arnold press, deltoids, dumbbell"},
    {"exercise_name": "Front Raises", "muscle_group": "Shoulders", "difficulty": "Beginner", "equipment": "Gym", "tags": "shoulders, front raise, delts, dumbbell"},
    {"exercise_name": "Reverse Pec Deck", "muscle_group": "Shoulders", "difficulty": "Beginner", "equipment": "Gym", "tags": "shoulders, rear delts, machine, reverse pec deck"},
    {"exercise_name": "Rear Delt Fly", "muscle_group": "Shoulders", "difficulty": "Beginner", "equipment": "Gym", "tags": "shoulders, rear delts, fly, dumbbell"},
    {"exercise_name": "Upright Row", "muscle_group": "Shoulders", "difficulty": "Intermediate", "equipment": "Gym", "tags": "shoulders, traps, upright row, barbell, cable"},
    {"exercise_name": "Machine Shoulder Press", "muscle_group": "Shoulders", "difficulty": "Beginner", "equipment": "Gym", "tags": "shoulders, press, machine, overhead"},
    {"exercise_name": "Cable Lateral Raise", "muscle_group": "Shoulders", "difficulty": "Intermediate", "equipment": "Gym", "tags": "shoulders, lateral, raise, cable, isolation"},

    # ARMS
    {"exercise_name": "Barbell Curls", "muscle_group": "Arms", "difficulty": "Beginner", "equipment": "Gym", "tags": "arms, curl, barbell, biceps, pull"},
    {"exercise_name": "Tricep Pushdowns", "muscle_group": "Arms", "difficulty": "Beginner", "equipment": "Gym", "tags": "arms, triceps, pushdown, cable, push"},
    {"exercise_name": "Hammer Curls", "muscle_group": "Arms", "difficulty": "Beginner", "equipment": "Gym", "tags": "arms, hammer curls, biceps, forearms, dumbbell"},
    {"exercise_name": "Preacher Curl", "muscle_group": "Arms", "difficulty": "Beginner", "equipment": "Gym", "tags": "arms, curl, preacher curl, biceps, bench"},
    {"exercise_name": "Incline Dumbbell Curl", "muscle_group": "Arms", "difficulty": "Intermediate", "equipment": "Gym", "tags": "arms, curl, incline, dumbbell, biceps"},
    {"exercise_name": "Concentration Curl", "muscle_group": "Arms", "difficulty": "Beginner", "equipment": "Gym", "tags": "arms, curl, concentration, dumbbell, biceps"},
    {"exercise_name": "Cable Curl", "muscle_group": "Arms", "difficulty": "Beginner", "equipment": "Gym", "tags": "arms, curl, cable, biceps"},
    {"exercise_name": "Skull Crushers", "muscle_group": "Arms", "difficulty": "Intermediate", "equipment": "Gym", "tags": "arms, triceps, skull crusher, barbell, EZ bar"},
    {"exercise_name": "Overhead Tricep Extension", "muscle_group": "Arms", "difficulty": "Beginner", "equipment": "Gym", "tags": "arms, triceps, extension, overhead, dumbbell, cable"},
    {"exercise_name": "Close Grip Bench Press", "muscle_group": "Arms", "difficulty": "Intermediate", "equipment": "Gym", "tags": "arms, chest, triceps, bench, close grip"},
    {"exercise_name": "Tricep Dips", "muscle_group": "Arms", "difficulty": "Beginner", "equipment": "Home", "tags": "arms, triceps, dips, bodyweight"},

    # CORE
    {"exercise_name": "Plank Hold", "muscle_group": "Core", "difficulty": "Beginner", "equipment": "Home", "tags": "core, plank, hold, bodyweight, abs, home, stability"},
    {"exercise_name": "Hanging Leg Raises", "muscle_group": "Core", "difficulty": "Advanced", "equipment": "Gym", "tags": "core, abs, raise, hanging, bar, lower abs"},
    {"exercise_name": "Cable Crunches", "muscle_group": "Core", "difficulty": "Intermediate", "equipment": "Gym", "tags": "core, abs, crunch, cable, flexion"},
    {"exercise_name": "Russian Twist", "muscle_group": "Core", "difficulty": "Beginner", "equipment": "Home", "tags": "core, twist, russian twist, abs, bodyweight"},
    {"exercise_name": "Bicycle Crunch", "muscle_group": "Core", "difficulty": "Beginner", "equipment": "Home", "tags": "core, abs, crunch, bicycle, bodyweight"},
    {"exercise_name": "Mountain Climbers", "muscle_group": "Core", "difficulty": "Beginner", "equipment": "Home", "tags": "core, cardio, abs, bodyweight, mountain climber"},
    {"exercise_name": "Dead Bug", "muscle_group": "Core", "difficulty": "Beginner", "equipment": "Home", "tags": "core, dead bug, stability, bodyweight"},
    {"exercise_name": "Side Plank", "muscle_group": "Core", "difficulty": "Beginner", "equipment": "Home", "tags": "core, plank, side plank, bodyweight, obliques"},
    {"exercise_name": "Reverse Crunch", "muscle_group": "Core", "difficulty": "Beginner", "equipment": "Home", "tags": "core, crunch, reverse, abs, lower abs"},
    {"exercise_name": "Ab Wheel Rollout", "muscle_group": "Core", "difficulty": "Advanced", "equipment": "Gym", "tags": "core, rollout, ab wheel, abs"}
]


class InsightService:
    @staticmethod
    def ensure_exercise_embeddings():
        if ExerciseEmbedding.query.count() > 0:
            return

        for item in DEFAULT_EXERCISES:
            db.session.add(
                ExerciseEmbedding(
                    exercise_name=item["exercise_name"],
                    muscle_group=item["muscle_group"],
                    difficulty=item["difficulty"],
                    equipment=item["equipment"],
                    tags=item["tags"],
                )
            )
        db.session.commit()

    @classmethod
    def get_exercise_catalog(cls):
        cls.ensure_exercise_embeddings()
        rows = ExerciseEmbedding.query.order_by(
            ExerciseEmbedding.muscle_group.asc(),
            ExerciseEmbedding.exercise_name.asc(),
        ).all()
        return [row.to_dict() for row in rows]

    @staticmethod
    def build_exercise_lookup(exercises):
        lookup = {}
        for exercise in exercises:
            name = (exercise.get("exercise_name") or "").strip().lower()
            muscle = exercise.get("muscle_group")
            if name and muscle:
                lookup[name] = muscle
        return lookup

    @staticmethod
    def group_workout_sessions(workouts):
        ordered_sessions = []
        grouped = {}

        sorted_workouts = sorted(
            workouts,
            key=lambda workout: workout.created_at or datetime.min,
            reverse=True,
        )

        for workout in sorted_workouts:
            created_at = workout.created_at or datetime.min
            minute_bucket = created_at.replace(second=0, microsecond=0)
            key = (workout.workout_name.strip().lower(), minute_bucket.isoformat())

            if key not in grouped:
                session = {
                    "id": workout.id,
                    "session_key": f"{minute_bucket.isoformat()}::{workout.workout_name}",
                    "name": workout.workout_name,
                    "date": created_at.date().isoformat() if workout.created_at else None,
                    "created_at": workout.created_at.isoformat() if workout.created_at else None,
                    "duration": 0,
                    "calories": 0,
                    "exercisesCount": 0,
                    "exercises": [],
                }
                grouped[key] = session
                ordered_sessions.append(session)

            session = grouped[key]
            session["duration"] += int(workout.duration or 0)
            session["calories"] += int(workout.calories_burned or 0)
            session["exercisesCount"] += 1
            session["exercises"].append(
                {
                    "id": workout.id,
                    "name": workout.exercise_name,
                    "sets": workout.sets,
                    "reps": workout.reps,
                    "duration": workout.duration,
                    "calories": workout.calories_burned,
                    "created_at": workout.created_at.isoformat() if workout.created_at else None,
                }
            )

        return ordered_sessions

    @staticmethod
    def calculate_streak(sessions, today=None):
        if not sessions:
            return 0, 0

        workout_dates = sorted(
            {
                datetime.fromisoformat(session["created_at"]).date()
                for session in sessions
                if session.get("created_at")
            }
        )
        if not workout_dates:
            return 0, 0

        best_streak = 1
        running = 1
        for idx in range(1, len(workout_dates)):
            if (workout_dates[idx] - workout_dates[idx - 1]).days == 1:
                running += 1
            else:
                best_streak = max(best_streak, running)
                running = 1
        best_streak = max(best_streak, running)

        ref_today = today or datetime.utcnow().date()
        last_date = workout_dates[-1]
        if (ref_today - last_date).days > 1:
            return 0, best_streak

        current_streak = 1
        for idx in range(len(workout_dates) - 1, 0, -1):
            if (workout_dates[idx] - workout_dates[idx - 1]).days == 1:
                current_streak += 1
            else:
                break

        return current_streak, best_streak

    @staticmethod
    def infer_muscle_group(exercise_name, workout_name, exercise_lookup):
        exercise_name = (exercise_name or "").strip().lower()
        workout_name = (workout_name or "").strip().lower()

        if exercise_name in exercise_lookup:
            return exercise_lookup[exercise_name]

        searchable = f"{exercise_name} {workout_name}"
        for muscle in MUSCLE_GROUPS:
            if muscle.lower() in searchable:
                return muscle

        keyword_map = {
            "Chest": ["bench", "push-up", "push up", "fly", "dip"],
            "Back": ["row", "pull", "deadlift", "lat"],
            "Legs": ["squat", "lunge", "leg press", "hamstring", "rdl"],
            "Shoulders": ["press", "lateral", "rear delt", "face pull"],
            "Arms": ["curl", "tricep", "bicep", "skull crusher"],
            "Core": ["plank", "crunch", "raise", "abs", "core"],
        }
        for muscle, keywords in keyword_map.items():
            if any(keyword in searchable for keyword in keywords):
                return muscle

        return "Full Body"

    @staticmethod
    def build_week_activity(sessions):
        today = datetime.utcnow().date()
        active_days = {
            datetime.fromisoformat(session["created_at"]).date()
            for session in sessions
            if session.get("created_at")
        }

        activity = []
        for offset in range(6, -1, -1):
            target_day = today - timedelta(days=offset)
            activity.append(
                {
                    "date": target_day.isoformat(),
                    "label": target_day.strftime("%a")[0],
                    "active": target_day in active_days,
                }
            )
        return activity

    @staticmethod
    def calculate_goal_progress(user_goal, weight_logs, monthly_sessions, planned_days):
        goal_text = (user_goal or "").strip().lower()

        if len(weight_logs) >= 2 and ("loss" in goal_text or "gain" in goal_text or "bulk" in goal_text):
            start_weight = float(weight_logs[-1].weight)
            current_weight = float(weight_logs[0].weight)

            if "loss" in goal_text:
                target_delta = max(2.0, round(start_weight * 0.06, 1))
                current_delta = max(0.0, start_weight - current_weight)
            else:
                target_delta = max(2.0, round(start_weight * 0.04, 1))
                current_delta = max(0.0, current_weight - start_weight)

            progress = min(100, round((current_delta / target_delta) * 100)) if target_delta else 0
            return {
                "current": progress,
                "target": 100,
                "label": "On Track" if progress >= 50 else "In Progress",
            }

        monthly_target = max(4, (planned_days or 3) * 4)
        progress = min(100, round((monthly_sessions / monthly_target) * 100)) if monthly_target else 0
        return {
            "current": progress,
            "target": 100,
            "label": "On Track" if progress >= 70 else "Building Momentum",
        }

    @classmethod
    def build_dashboard_widgets(cls, user, sessions, weight_logs, fitness_profile, exercise_catalog):
        today = datetime.utcnow().date()
        week_start = today - timedelta(days=6)
        week_sessions = [
            session
            for session in sessions
            if session.get("created_at")
            and datetime.fromisoformat(session["created_at"]).date() >= week_start
        ]
        today_sessions = [
            session
            for session in sessions
            if session.get("created_at")
            and datetime.fromisoformat(session["created_at"]).date() == today
        ]
        monthly_sessions = [
            session
            for session in sessions
            if session.get("created_at")
            and datetime.fromisoformat(session["created_at"]).date() >= today - timedelta(days=29)
        ]

        current_streak, best_streak = cls.calculate_streak(sessions, today=today)
        planned_days = fitness_profile.available_days if fitness_profile else 3
        calorie_goal = max(300, int(round((user.weight or 75) * 6)))
        calories_today = sum(session["calories"] for session in today_sessions)
        calories_week = sum(session["calories"] for session in week_sessions)

        exercise_lookup = cls.build_exercise_lookup(exercise_catalog)
        muscles = []
        for session in week_sessions:
            for exercise in session["exercises"]:
                muscle = cls.infer_muscle_group(exercise.get("name"), session["name"], exercise_lookup)
                if muscle not in muscles:
                    muscles.append(muscle)

        latest_session = sessions[0] if sessions else None
        if latest_session:
            intensity = max(
                1,
                min(
                    10,
                    round(
                        (latest_session["calories"] or 200)
                        / max(latest_session["duration"] or 45, 1)
                        / 1.5
                    ),
                ),
            )
            soreness = min(8, max(2, len(week_sessions)))
            recovery_pred = MLService.predict_recovery_score(
                sleep_hours=7.0,
                workout_duration=latest_session["duration"] or 45,
                workout_intensity=intensity,
                muscle_soreness=soreness,
                calories_burned=latest_session["calories"] or 250,
            )
            recovery_status = {
                "score": recovery_pred["recovery_score"],
                "label": recovery_pred["label"],
                "color": "green" if recovery_pred["recovery_score"] >= 75 else "yellow",
            }
        else:
            recovery_status = {"score": 0, "label": "Log a workout", "color": "gray"}

        completed_this_week = len(week_sessions)
        goal_progress = cls.calculate_goal_progress(
            user_goal=user.fitness_goal,
            weight_logs=weight_logs,
            monthly_sessions=len(monthly_sessions),
            planned_days=planned_days,
        )

        return {
            "calories_burned": {
                "burned": calories_today,
                "today": calories_today,
                "goal": calorie_goal,
                "week_total": calories_week,
            },
            "workout_streak": {"current": current_streak, "best": best_streak, "unit": "days"},
            "weekly_consistency": {
                "completed": completed_this_week,
                "planned": planned_days,
                "percentage": min(100, round((completed_this_week / max(planned_days, 1)) * 100)),
            },
            "goal_progress": goal_progress,
            "recovery_status": recovery_status,
            "muscle_groups_trained": muscles,
            "week_activity": cls.build_week_activity(sessions),
        }

    @staticmethod
    def _relative_time(dt_value):
        if not dt_value:
            return "recently"

        now = datetime.utcnow()
        delta = now - dt_value
        seconds = int(delta.total_seconds())
        if seconds < 60:
            return "just now"
        if seconds < 3600:
            return f"{seconds // 60}m ago"
        if seconds < 86400:
            return f"{seconds // 3600}h ago"
        return f"{delta.days}d ago"

    @classmethod
    def build_exercise_data(cls, user, sessions):
        exercises = cls.get_exercise_catalog()
        lookup = cls.build_exercise_lookup(exercises)

        usage_counter = Counter()
        recent_muscles = Counter()
        for session in sessions:
            for exercise in session["exercises"]:
                name = exercise.get("name")
                if not name:
                    continue
                usage_counter[name] += 1
                muscle = cls.infer_muscle_group(name, session["name"], lookup)
                recent_muscles[muscle] += 1

        popular_names = [name for name, _ in usage_counter.most_common(6)]
        if not popular_names:
            popular_names = [exercise["exercise_name"] for exercise in exercises[:6]]

        goal_text = (user.fitness_goal or "").lower()
        goal_targets = {
            "loss": ["Legs", "Back", "Core"],
            "gain": ["Chest", "Back", "Legs"],
            "endurance": ["Legs", "Core", "Shoulders"],
        }
        target_muscles = []
        for keyword, muscles in goal_targets.items():
            if keyword in goal_text:
                target_muscles = muscles
                break
        if not target_muscles:
            target_muscles = ["Chest", "Legs", "Back"]

        recommendations = []
        used_names = set()
        sorted_exercises = sorted(
            exercises,
            key=lambda exercise: (
                recent_muscles.get(exercise["muscle_group"], 0),
                exercise["difficulty"],
                exercise["exercise_name"],
            ),
        )

        for muscle in target_muscles:
            match = next(
                (
                    exercise
                    for exercise in sorted_exercises
                    if exercise["muscle_group"] == muscle
                    and exercise["exercise_name"] not in used_names
                ),
                None,
            )
            if not match:
                continue
            used_names.add(match["exercise_name"])
            recommendations.append(
                {
                    "name": match["exercise_name"],
                    "muscle": match["muscle_group"],
                    "reason": f"Supports your {user.fitness_goal or 'current'} focus with {muscle.lower()} work.",
                }
            )

        popular = [
            {
                "name": exercise["exercise_name"],
                "muscle": exercise["muscle_group"],
                "difficulty": exercise["difficulty"],
                "equipment": exercise["equipment"],
                "sets": "3x12",
                "popular": exercise["exercise_name"] in popular_names,
            }
            for exercise in exercises
        ]

        return {
            "exercises": popular,
            "recommendations": recommendations,
            "popular": [exercise for exercise in popular if exercise["popular"]],
        }

    @staticmethod
    def build_attendance_summary(sessions, planned_days):
        today = datetime.utcnow().date()
        counts_by_day = Counter()
        for session in sessions:
            if session.get("created_at"):
                counts_by_day[datetime.fromisoformat(session["created_at"]).date()] += 1

        heatmap = []
        for offset in range(364, -1, -1):
            target_day = today - timedelta(days=offset)
            heatmap.append(
                {
                    "date": target_day.isoformat(),
                    "intensity": min(4, counts_by_day.get(target_day, 0)),
                }
            )

        recent_active_days = sum(
            1 for day, count in counts_by_day.items() if count > 0 and day >= today - timedelta(days=27)
        )
        monthly_target = max(1, (planned_days or 3) * 4)
        consistency_score = min(100, round((recent_active_days / monthly_target) * 100))
        current_streak, _ = InsightService.calculate_streak(sessions, today=today)

        monthly = []
        for month_offset in range(3, -1, -1):
            year = today.year
            month = today.month - month_offset
            while month <= 0:
                month += 12
                year -= 1

            days_in_month = calendar.monthrange(year, month)[1]
            month_start = datetime(year, month, 1).date()
            month_end = datetime(year, month, days_in_month).date()
            completed = sum(
                1
                for day, count in counts_by_day.items()
                if count > 0 and month_start <= day <= month_end
            )
            monthly.append(
                {
                    "label": datetime(year, month, 1).strftime("%b"),
                    "completed": completed,
                    "total": days_in_month,
                }
            )

        return {
            "streak_current": current_streak,
            "heatmap": heatmap,
            "total_workouts": len(sessions),
            "consistency_score": consistency_score,
            "monthly": monthly,
        }

    @staticmethod
    def build_goal_summary(user, sessions, weight_logs, planned_days):
        today = datetime.utcnow().date()
        streak_current, _ = InsightService.calculate_streak(sessions, today=today)
        monthly_sessions = sum(
            1
            for session in sessions
            if session.get("created_at")
            and datetime.fromisoformat(session["created_at"]).date() >= today - timedelta(days=29)
        )

        cards = []
        goal_text = user.fitness_goal or "Consistency"
        if len(weight_logs) >= 2 and ("loss" in goal_text.lower() or "gain" in goal_text.lower()):
            start_weight = float(weight_logs[-1].weight)
            current_weight = float(weight_logs[0].weight)
            if "loss" in goal_text.lower():
                target = max(2.0, round(start_weight * 0.06, 1))
                current = round(max(0.0, start_weight - current_weight), 1)
                color = "bg-green-500"
            else:
                target = max(2.0, round(start_weight * 0.04, 1))
                current = round(max(0.0, current_weight - start_weight), 1)
                color = "bg-blue-500"
            cards.append(
                {
                    "title": goal_text,
                    "target": target,
                    "current": current,
                    "unit": "kg",
                    "colorClass": color,
                }
            )

        cards.extend(
            [
                {
                    "title": "Monthly Workouts",
                    "target": max(4, (planned_days or 3) * 4),
                    "current": monthly_sessions,
                    "unit": "sessions",
                    "colorClass": "bg-purple-500",
                },
                {
                    "title": "Workout Streak",
                    "target": max(7, streak_current or 7),
                    "current": streak_current,
                    "unit": "days",
                    "colorClass": "bg-yellow-500",
                },
            ]
        )

        milestones = [
            {
                "title": "Account Created",
                "date": user.created_at.strftime("%b %d, %Y") if user.created_at else "N/A",
                "status": "Completed",
            }
        ]
        if sessions:
            first_session = sessions[-1]
            created_at = datetime.fromisoformat(first_session["created_at"]) if first_session.get("created_at") else None
            milestones.append(
                {
                    "title": "First Workout Logged",
                    "date": created_at.strftime("%b %d, %Y") if created_at else "N/A",
                    "status": "Completed",
                }
            )
        if len(weight_logs) >= 2:
            milestones.append(
                {
                    "title": "Weight Trend Established",
                    "date": weight_logs[0].date.strftime("%b %d, %Y"),
                    "status": "Completed",
                }
            )

        badges = []
        if streak_current >= 7:
            badges.append({"name": "Consistency", "icon": "Streak", "color": "from-yellow-500/20 to-orange-500/20"})
        if monthly_sessions >= max(4, planned_days or 3):
            badges.append({"name": "Routine Locked", "icon": "Rhythm", "color": "from-green-500/20 to-emerald-500/20"})
        if len(weight_logs) >= 5:
            badges.append({"name": "Data Driven", "icon": "Metrics", "color": "from-blue-500/20 to-indigo-500/20"})

        return {
            "cards": cards[:3],
            "milestones": milestones,
            "badges": badges,
        }

    @staticmethod
    def build_profile_summary(user, fitness_profile, sessions, weight_logs, progress_logs):
        total_sessions = len(sessions)
        avg_duration = round(
            sum(session["duration"] for session in sessions) / total_sessions,
            1,
        ) if total_sessions else 0
        avg_calories = round(
            sum(session["calories"] for session in sessions) / total_sessions,
            1,
        ) if total_sessions else 0

        if total_sessions >= 60:
            athlete_level = "Advanced"
        elif total_sessions >= 20:
            athlete_level = "Consistent"
        elif total_sessions > 0:
            athlete_level = "Building"
        else:
            athlete_level = "Starting"

        experience = fitness_profile.experience_level if fitness_profile else athlete_level
        goal = user.fitness_goal or (fitness_profile.fitness_goal if fitness_profile else "General Fitness")
        bio = (
            f"Focused on {goal.lower()} with {experience.lower()} training preferences. "
            f"{total_sessions} workout sessions and {len(weight_logs)} weight entries are shaping your training profile."
        )

        achievements = []
        if total_sessions:
            achievements.append({"name": "Workout Logged", "icon": "Dumbbell", "color": "bg-green-500/10 border-green-500/20"})
        if len(weight_logs) >= 3:
            achievements.append({"name": "Trend Tracker", "icon": "Scale", "color": "bg-blue-500/10 border-blue-500/20"})
        if progress_logs:
            achievements.append({"name": "Metrics Synced", "icon": "Chart", "color": "bg-purple-500/10 border-purple-500/20"})

        milestones = []
        if sessions:
            latest_session = sessions[0]
            milestones.append(
                {
                    "title": latest_session["name"],
                    "date": InsightService._relative_time(datetime.fromisoformat(latest_session["created_at"])),
                    "icon": "Workout",
                    "color": "text-green-500",
                }
            )
        if len(weight_logs) >= 2:
            delta = round(weight_logs[0].weight - weight_logs[-1].weight, 1)
            milestones.append(
                {
                    "title": f"Weight trend {delta:+} kg",
                    "date": weight_logs[0].date.strftime("%b %d, %Y"),
                    "icon": "Weight",
                    "color": "text-blue-500",
                }
            )
        if progress_logs:
            latest_progress = progress_logs[0]
            milestones.append(
                {
                    "title": "Progress metrics updated",
                    "date": latest_progress.created_at.strftime("%b %d, %Y") if latest_progress.created_at else "recently",
                    "icon": "Progress",
                    "color": "text-purple-500",
                }
            )

        return {
            "member_since": user.created_at.strftime("%b %Y") if user.created_at else None,
            "role_label": "Athlete",
            "bio": bio,
            "athlete_level": athlete_level,
            "performance_dna": [
                {"label": "Athletic Level", "value": athlete_level, "color": "text-purple-500"},
                {"label": "Total Sessions", "value": str(total_sessions), "color": "text-green-500"},
                {"label": "Avg. Session", "value": f"{avg_duration}m", "color": "text-blue-500"},
                {"label": "Avg. Calories", "value": f"{avg_calories}", "color": "text-orange-500"},
            ],
            "achievements": achievements,
            "milestones": milestones,
        }

    @staticmethod
    def build_notifications(sessions, weight_logs, meal_plans, workout_plans, chat_history):
        entries = []

        if sessions:
            latest_session = sessions[0]
            latest_session_dt = (
                datetime.fromisoformat(latest_session["created_at"])
                if latest_session.get("created_at")
                else None
            )
            entries.append(
                {
                    "title": "Workout synced",
                    "desc": f"{latest_session['name']} saved with {latest_session['exercisesCount']} exercise entries.",
                    "category": "Workout",
                    "time": InsightService._relative_time(latest_session_dt),
                    "icon": "Workout",
                    "color": "bg-green-500/10 text-green-500",
                }
            )

        if weight_logs:
            latest_weight = weight_logs[0]
            entries.append(
                {
                    "title": "Weight log updated",
                    "desc": f"Latest entry recorded at {latest_weight.weight} kg.",
                    "category": "Tracking",
                    "time": InsightService._relative_time(latest_weight.created_at),
                    "icon": "Weight",
                    "color": "bg-blue-500/10 text-blue-500",
                }
            )

        if meal_plans:
            latest_meal = meal_plans[0]
            entries.append(
                {
                    "title": "Meal plan generated",
                    "desc": f"{latest_meal.calorie_target} kcal nutrition plan is ready.",
                    "category": "Nutrition",
                    "time": InsightService._relative_time(latest_meal.created_at),
                    "icon": "Meal",
                    "color": "bg-yellow-500/10 text-yellow-500",
                }
            )

        if workout_plans:
            latest_plan = workout_plans[0]
            entries.append(
                {
                    "title": "AI workout plan ready",
                    "desc": latest_plan.plan_name,
                    "category": "AI Coach",
                    "time": InsightService._relative_time(latest_plan.created_at),
                    "icon": "AI",
                    "color": "bg-purple-500/10 text-purple-500",
                }
            )

        if chat_history:
            latest_chat = chat_history[0]
            entries.append(
                {
                    "title": "AI coach conversation updated",
                    "desc": latest_chat.message[:120],
                    "category": "AI Coach",
                    "time": InsightService._relative_time(latest_chat.created_at),
                    "icon": "Chat",
                    "color": "bg-emerald-500/10 text-emerald-500",
                }
            )

        return entries[:6]

    @staticmethod
    def build_reports_summary(sessions, weight_logs, progress_logs, predictions):
        return [
            {
                "title": "Workout History",
                "type": "CSV / PDF",
                "count": f"{len(sessions)} Sessions",
                "last_updated": sessions[0]["date"] if sessions else None,
                "icon": "Workout",
                "color": "text-blue-500",
            },
            {
                "title": "Weight Progression",
                "type": "PNG / PDF",
                "count": f"{len(weight_logs)} Logs",
                "last_updated": weight_logs[0].date.isoformat() if weight_logs else None,
                "icon": "Weight",
                "color": "text-green-500",
            },
            {
                "title": "ML Forecast Archive",
                "type": "JSON / PDF",
                "count": f"{len(predictions)} Runs",
                "last_updated": predictions[0].created_at.isoformat() if predictions else None,
                "icon": "AI",
                "color": "text-purple-500",
            },
            {
                "title": "Body Metrics",
                "type": "CSV / PDF",
                "count": f"{len(progress_logs)} Entries",
                "last_updated": progress_logs[0].date.isoformat() if progress_logs else None,
                "icon": "Progress",
                "color": "text-orange-500",
            },
        ]
