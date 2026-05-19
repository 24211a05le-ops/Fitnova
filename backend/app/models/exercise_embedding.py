from datetime import datetime
from app import db

class ExerciseEmbedding(db.Model):
    """Stores keyword tags and basic mappings for semantic smart searching without needing heavy external vector dbs"""
    __tablename__ = 'exercise_embeddings'

    id = db.Column(db.Integer, primary_key=True)
    exercise_name = db.Column(db.String(200), nullable=False, unique=True)
    muscle_group = db.Column(db.String(100), nullable=False)
    
    tags = db.Column(db.Text, nullable=False) # Comma-separated synonyms (e.g. "lower chest, bench press, decline")
    difficulty = db.Column(db.String(50), default="Intermediate")
    equipment = db.Column(db.String(100), default="Gym")

    def to_dict(self):
        return {
            "id": self.id,
            "exercise_name": self.exercise_name,
            "muscle_group": self.muscle_group,
            "tags": [t.strip() for t in self.tags.split(",") if t.strip()],
            "difficulty": self.difficulty,
            "equipment": self.equipment
        }
