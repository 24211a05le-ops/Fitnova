from app import create_app, db
from app.models.exercise_embedding import ExerciseEmbedding

def seed_database_exercises():
    app = create_app()
    with app.app_context():
        print("[Fitnova Seed] Checking exercise embeddings database...")
        
        # Check if already seeded
        existing_count = ExerciseEmbedding.query.count()
        if existing_count > 0:
            print(f"[Fitnova Seed] Database already contains {existing_count} exercises. Skipping seed.")
            return

        print("[Fitnova Seed] Seeding high-quality default exercises...")
        
        default_exercises = [
            # Chest
            {
                "exercise_name": "Barbell Bench Press",
                "muscle_group": "Chest",
                "difficulty": "Intermediate",
                "equipment": "Gym",
                "tags": "chest, press, bench, push, triceps, power, strength"
            },
            {
                "exercise_name": "Incline Dumbbell Press",
                "muscle_group": "Chest",
                "difficulty": "Intermediate",
                "equipment": "Gym",
                "tags": "chest, incline, dumbbell, press, push, upper chest"
            },
            {
                "exercise_name": "Push-Ups",
                "muscle_group": "Chest",
                "difficulty": "Beginner",
                "equipment": "Home",
                "tags": "chest, bodyweight, floor, push, home, arms, triceps"
            },
            {
                "exercise_name": "Cable Flyes",
                "muscle_group": "Chest",
                "difficulty": "Intermediate",
                "equipment": "Gym",
                "tags": "chest, cable, fly, squeeze, inner chest, isolation"
            },
            # Back
            {
                "exercise_name": "Deadlift",
                "muscle_group": "Back",
                "difficulty": "Advanced",
                "equipment": "Gym",
                "tags": "back, deadlift, compound, lower back, hamstrings, legs, pull, power"
            },
            {
                "exercise_name": "Pull-Ups",
                "muscle_group": "Back",
                "difficulty": "Intermediate",
                "equipment": "Home",
                "tags": "back, pullup, lats, biceps, pull, bodyweight, upper back"
            },
            {
                "exercise_name": "Barbell Rows",
                "muscle_group": "Back",
                "difficulty": "Intermediate",
                "equipment": "Gym",
                "tags": "back, row, barbell, pull, lats, thickness, biceps"
            },
            {
                "exercise_name": "Lat Pulldown",
                "muscle_group": "Back",
                "difficulty": "Beginner",
                "equipment": "Gym",
                "tags": "back, lats, pulldown, cable, biceps, pull"
            },
            # Legs
            {
                "exercise_name": "Barbell Squats",
                "muscle_group": "Legs",
                "difficulty": "Intermediate",
                "equipment": "Gym",
                "tags": "legs, squat, barbell, quadriceps, glutes, compound, lower body"
            },
            {
                "exercise_name": "Walking Lunges",
                "muscle_group": "Legs",
                "difficulty": "Beginner",
                "equipment": "Home",
                "tags": "legs, lunge, home, bodyweight, quadriceps, balance, glutes"
            },
            {
                "exercise_name": "Romanian Deadlift",
                "muscle_group": "Legs",
                "difficulty": "Intermediate",
                "equipment": "Gym",
                "tags": "legs, rdl, hamstring, glutes, lower back, barbell"
            },
            # Shoulders
            {
                "exercise_name": "Overhead Press",
                "muscle_group": "Shoulders",
                "difficulty": "Intermediate",
                "equipment": "Gym",
                "tags": "shoulders, ohp, press, deltoids, push, overhead, arms"
            },
            {
                "exercise_name": "Lateral Raises",
                "muscle_group": "Shoulders",
                "difficulty": "Beginner",
                "equipment": "Gym",
                "tags": "shoulders, lateral, raise, delts, side delts, dumbbell, isolation"
            },
            # Arms
            {
                "exercise_name": "Barbell Curls",
                "muscle_group": "Arms",
                "difficulty": "Beginner",
                "equipment": "Gym",
                "tags": "arms, curl, barbell, biceps, pull"
            },
            {
                "exercise_name": "Tricep Pushdowns",
                "muscle_group": "Arms",
                "difficulty": "Beginner",
                "equipment": "Gym",
                "tags": "arms, triceps, pushdown, cable, push"
            },
            # Core
            {
                "exercise_name": "Plank Hold",
                "muscle_group": "Core",
                "difficulty": "Beginner",
                "equipment": "Home",
                "tags": "core, plank, hold, bodyweight, abs, home, stability"
            },
            {
                "exercise_name": "Hanging Leg Raises",
                "muscle_group": "Core",
                "difficulty": "Advanced",
                "equipment": "Gym",
                "tags": "core, abs, raise, hanging, bar, lower abs"
            }
        ]

        for item in default_exercises:
            ex = ExerciseEmbedding(
                exercise_name=item["exercise_name"],
                muscle_group=item["muscle_group"],
                difficulty=item["difficulty"],
                equipment=item["equipment"],
                tags=item["tags"]
            )
            db.session.add(ex)
            
        db.session.commit()
        print("[Fitnova Seed] Exercise library successfully seeded!")

if __name__ == "__main__":
    seed_database_exercises()
