"""
seed_exercises.py
-----------------
Force-reseeds the exercise_embeddings table with the full updated exercise catalog.

Run from the backend/ directory:
    python seed_exercises.py

This script:
  1. Clears all existing rows in exercise_embeddings.
  2. Inserts every exercise in DEFAULT_EXERCISES from insight_service.py.
"""

import sys
import os

# Ensure the backend directory is on sys.path so we can import `app`
sys.path.insert(0, os.path.dirname(__file__))

from app import create_app, db
from app.models.exercise_embedding import ExerciseEmbedding
from app.services.insight_service import DEFAULT_EXERCISES


def seed_exercises():
    app = create_app()
    with app.app_context():
        # ── Step 1: Count existing rows ──────────────────────────────────────
        existing = ExerciseEmbedding.query.count()
        print(f"[seed_exercises] Found {existing} existing exercise embedding(s).")

        # ── Step 2: Clear the table ──────────────────────────────────────────
        deleted = ExerciseEmbedding.query.delete()
        db.session.commit()
        print(f"[seed_exercises] Cleared {deleted} row(s) from exercise_embeddings.")

        # ── Step 3: Insert all exercises ─────────────────────────────────────
        inserted = 0
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
            inserted += 1

        db.session.commit()
        print(f"[seed_exercises] SUCCESS: Inserted {inserted} exercise(s).")

        # ── Step 4: Verify ───────────────────────────────────────────────────
        final_count = ExerciseEmbedding.query.count()
        print(f"[seed_exercises] Verification: {final_count} row(s) now in exercise_embeddings.\n")

        # Print summary by muscle group
        from sqlalchemy import func
        rows = (
            db.session.query(ExerciseEmbedding.muscle_group, func.count(ExerciseEmbedding.id))
            .group_by(ExerciseEmbedding.muscle_group)
            .order_by(ExerciseEmbedding.muscle_group)
            .all()
        )
        print("  Muscle Group Breakdown:")
        for muscle, count in rows:
            print(f"    {muscle:<15} {count} exercise(s)")

        print("\n[seed_exercises] Done!")


if __name__ == "__main__":
    seed_exercises()
