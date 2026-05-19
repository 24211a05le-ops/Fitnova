from datetime import datetime
from app import db

class FitnessProfile(db.Model):
    """Stores detailed onboarding fitness preferences for AI-ready personalization"""
    __tablename__ = 'fitness_profiles'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="CASCADE"), nullable=False, unique=True)

    # Onboarding fitness fields
    fitness_goal = db.Column(db.String(100), nullable=True)          # e.g. Weight Loss, Muscle Gain
    experience_level = db.Column(db.String(50), nullable=True)       # Beginner, Intermediate, Advanced
    workout_preference = db.Column(db.String(100), nullable=True)    # Home, Gym, Outdoor, Mixed
    available_days = db.Column(db.Integer, nullable=True, default=3) # Days per week (1-7)
    equipment_access = db.Column(db.String(200), nullable=True)      # JSON-like: "Dumbbells,Barbell,Bench"
    injuries = db.Column(db.Text, nullable=True)                     # Free text for injuries/limitations

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "fitness_goal": self.fitness_goal,
            "experience_level": self.experience_level,
            "workout_preference": self.workout_preference,
            "available_days": self.available_days,
            "equipment_access": self.equipment_access,
            "injuries": self.injuries,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
