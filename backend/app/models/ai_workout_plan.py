from datetime import datetime
from app import db

class AIWorkoutPlan(db.Model):
    """Stores AI-generated (currently mock/template) workout plans for users"""
    __tablename__ = 'ai_workout_plans'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="CASCADE"), nullable=False)

    plan_name = db.Column(db.String(200), nullable=False)
    goal = db.Column(db.String(100), nullable=True)
    difficulty = db.Column(db.String(50), nullable=True)      # Beginner, Intermediate, Advanced
    duration_weeks = db.Column(db.Integer, nullable=True, default=4)
    sessions_per_week = db.Column(db.Integer, nullable=True, default=4)
    equipment_needed = db.Column(db.String(300), nullable=True)
    plan_data = db.Column(db.Text, nullable=True)             # JSON string of the full weekly plan
    rationale = db.Column(db.Text, nullable=True)             # "Why this workout?" explanation
    progression_notes = db.Column(db.Text, nullable=True)     # Suggested progression

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        import json
        plan = None
        if self.plan_data:
            try:
                plan = json.loads(self.plan_data)
            except (json.JSONDecodeError, TypeError):
                plan = self.plan_data

        return {
            "id": self.id,
            "user_id": self.user_id,
            "plan_name": self.plan_name,
            "goal": self.goal,
            "difficulty": self.difficulty,
            "duration_weeks": self.duration_weeks,
            "sessions_per_week": self.sessions_per_week,
            "equipment_needed": self.equipment_needed,
            "plan_data": plan,
            "rationale": self.rationale,
            "progression_notes": self.progression_notes,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
