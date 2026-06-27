from datetime import datetime
from app import db


class MLModelMetric(db.Model):
    """Stores retraining metrics and training metadata for each model version."""
    __tablename__ = 'ml_model_metrics'

    id = db.Column(db.Integer, primary_key=True)
    model_name = db.Column(db.String(100), nullable=False, index=True)
    metric_name = db.Column(db.String(100), nullable=False)
    metric_value = db.Column(db.Float, nullable=False)
    sample_count = db.Column(db.Integer, nullable=True)
    details = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        import json
        details = {}
        if self.details:
            try:
                details = json.loads(self.details)
            except Exception:
                details = self.details

        return {
            "id": self.id,
            "model_name": self.model_name,
            "metric_name": self.metric_name,
            "metric_value": self.metric_value,
            "sample_count": self.sample_count,
            "details": details,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
