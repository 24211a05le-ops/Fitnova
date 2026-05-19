from datetime import datetime
from app import db

class WeightLog(db.Model):
    """Tracks user weight entries over time for analytics and trend visualization"""
    __tablename__ = 'weight_logs'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="CASCADE"), nullable=False)

    weight = db.Column(db.Float, nullable=False)            # kg
    date = db.Column(db.Date, nullable=False, default=datetime.utcnow().date)
    notes = db.Column(db.Text, nullable=True)               # Optional notes
    photo_url = db.Column(db.String(500), nullable=True)    # Placeholder for progress photos

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "weight": self.weight,
            "date": self.date.isoformat() if self.date else None,
            "notes": self.notes,
            "photo_url": self.photo_url,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
