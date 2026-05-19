from datetime import datetime
from app import db

class MealPlan(db.Model):
    """Stores full AI generated premium meal planner telemetry"""
    __tablename__ = 'meal_plans'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    
    calorie_target = db.Column(db.Integer, nullable=False)
    diet_type = db.Column(db.String(100), nullable=True) # Vegetarian, Vegan, Non-Veg
    breakfast = db.Column(db.Text, nullable=True)
    lunch = db.Column(db.Text, nullable=True)
    dinner = db.Column(db.Text, nullable=True)
    snacks = db.Column(db.Text, nullable=True)
    
    proteins = db.Column(db.String(50), nullable=True)
    carbs = db.Column(db.String(50), nullable=True)
    fats = db.Column(db.String(50), nullable=True)
    
    meal_timing = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "calorie_target": self.calorie_target,
            "diet_type": self.diet_type,
            "breakfast": self.breakfast,
            "lunch": self.lunch,
            "dinner": self.dinner,
            "snacks": self.snacks,
            "macros": {
                "proteins": self.proteins,
                "carbs": self.carbs,
                "fats": self.fats
            },
            "meal_timing": self.meal_timing,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
