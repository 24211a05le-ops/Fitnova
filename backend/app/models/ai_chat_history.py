from datetime import datetime
from app import db

class AIChatHistory(db.Model):
    """Stores full user conversational telemetry logs with the AI Coach"""
    __tablename__ = 'ai_chat_history'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    
    sender = db.Column(db.String(20), nullable=False) # 'user' or 'coach'
    message = db.Column(db.Text, nullable=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "sender": self.sender,
            "message": self.message,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
