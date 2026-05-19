from app import create_app, db
from sqlalchemy import text

app = create_app()
with app.app_context():
    print("[Fitnova] Dropping conflicting legacy tables for clean redeployment...")
    try:
        db.session.execute(text("DROP TABLE IF EXISTS exercise_embeddings CASCADE;"))
        db.session.execute(text("DROP TABLE IF EXISTS meal_plans CASCADE;"))
        db.session.commit()
        print("[Fitnova] Tables successfully dropped.")
    except Exception as e:
        print(f"[Fitnova] Error dropping tables: {str(e)}")
