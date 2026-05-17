from datetime import datetime
from app import db

class Workout(db.Model):
    """Workout Model representing individual training sessions and sets"""
    __tablename__ = 'workouts'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    
    workout_name = db.Column(db.String(100), nullable=False) # e.g. "Push Day"
    exercise_name = db.Column(db.String(100), nullable=False) # e.g. "Incline Bench Press"
    
    sets = db.Column(db.Integer, nullable=False, default=1)
    reps = db.Column(db.Integer, nullable=False, default=1)
    
    calories_burned = db.Column(db.Integer, nullable=False, default=0)
    duration = db.Column(db.Integer, nullable=False, default=0) # in minutes
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        """Converts workout instance into JSON-ready dictionary representation"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "workout_name": self.workout_name,
            "exercise_name": self.exercise_name,
            "sets": self.sets,
            "reps": self.reps,
            "calories_burned": self.calories_burned,
            "duration": self.duration,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
