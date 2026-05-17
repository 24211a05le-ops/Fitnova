import bcrypt
from datetime import datetime
from app import db

class User(db.Model):
    """User Model representing physical stats and authentication credentials"""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(128), nullable=False)
    
    # Biometric Vital Statistics
    age = db.Column(db.Integer, nullable=True)
    gender = db.Column(db.String(20), nullable=True)
    height = db.Column(db.Float, nullable=True) # cm
    weight = db.Column(db.Float, nullable=True) # kg
    fitness_goal = db.Column(db.String(100), nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    workouts = db.relationship('Workout', backref='user', lazy=True, cascade="all, delete-orphan")
    progress_logs = db.relationship('ProgressLog', backref='user', lazy=True, cascade="all, delete-orphan")
    diet_plans = db.relationship('DietPlan', backref='user', lazy=True, cascade="all, delete-orphan")

    def set_password(self, password):
        """Hashes password with bcrypt and sets password_hash"""
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    def check_password(self, password):
        """Verifies if plaintext password matches password_hash using bcrypt"""
        try:
            return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
        except Exception:
            return False

    def to_dict(self):
        """Converts user instance into a clean python dict structure"""
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "age": self.age,
            "gender": self.gender,
            "height": self.height,
            "weight": self.weight,
            "fitness_goal": self.fitness_goal,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
