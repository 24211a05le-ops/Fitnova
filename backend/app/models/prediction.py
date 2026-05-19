from datetime import datetime
from app import db

class MLPrediction(db.Model):
    """Stores logged scikit-learn ML output telemetry profiles"""
    __tablename__ = 'ml_predictions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    
    prediction_type = db.Column(db.String(100), nullable=False) # 'weight', 'consistency', 'recovery', 'progressive_overload'
    input_data = db.Column(db.Text, nullable=False) # JSON serialization of input parameters
    output_data = db.Column(db.Text, nullable=False) # JSON serialization of predictions
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        import json
        inputs = {}
        outputs = {}
        try:
            inputs = json.loads(self.input_data)
        except Exception:
            inputs = self.input_data
        try:
            outputs = json.loads(self.output_data)
        except Exception:
            outputs = self.output_data

        return {
            "id": self.id,
            "user_id": self.user_id,
            "prediction_type": self.prediction_type,
            "input_data": inputs,
            "output_data": outputs,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
