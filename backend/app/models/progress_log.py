from datetime import datetime
from app import db

class ProgressLog(db.Model):
    """Stores user physical progression and telemetry over time."""
    __tablename__ = 'progress_logs'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    date = db.Column(db.Date, nullable=False, default=datetime.utcnow().date)
    weight = db.Column(db.Float, nullable=False)
    body_fat = db.Column(db.Float, nullable=True)
    muscle_mass = db.Column(db.Float, nullable=True)
    chest = db.Column(db.Float, nullable=True)
    waist = db.Column(db.Float, nullable=True)
    biceps = db.Column(db.Float, nullable=True)
    thighs = db.Column(db.Float, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "date": self.date.isoformat() if self.date else None,
            "weight": self.weight,
            "bodyFat": self.body_fat,
            "muscleMass": self.muscle_mass,
            "chest": self.chest,
            "waist": self.waist,
            "biceps": self.biceps,
            "thighs": self.thighs,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
