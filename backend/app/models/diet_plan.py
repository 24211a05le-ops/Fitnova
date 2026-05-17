from datetime import datetime
from app import db

class DietPlan(db.Model):
    """Stores AI-generated nutritional macros and meal plans for users."""
    __tablename__ = 'diet_plans'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    target_calories = db.Column(db.Integer, nullable=False)
    protein = db.Column(db.String(50), nullable=False)
    carbs = db.Column(db.String(50), nullable=False)
    fats = db.Column(db.String(50), nullable=False)
    meals = db.Column(db.JSON, nullable=True) # Neon PostgreSQL supports JSON natively!
    hydration = db.Column(db.String(100), nullable=True)
    tips = db.Column(db.JSON, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "calories": self.target_calories,
            "macros": {
                "protein": self.protein,
                "carbs": self.carbs,
                "fats": self.fats
            },
            "meals": self.meals,
            "hydration": self.hydration,
            "tips": self.tips,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
