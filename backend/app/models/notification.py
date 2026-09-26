from datetime import datetime
from app.extensions import db
from app.models.base import BaseModel

class Notification(BaseModel):
    __tablename__ = "notifications"


    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    title = db.Column(db.String(150), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(30), nullable=False)  # LOW_STOCK, OUT_OF_STOCK, AI_ALERT, SYSTEM, OPERATION
    is_read = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)

    user = db.relationship("User")

    TYPES = ["LOW_STOCK", "OUT_OF_STOCK", "AI_ALERT", "SYSTEM", "OPERATION"]

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "message": self.message,
            "type": self.type,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
