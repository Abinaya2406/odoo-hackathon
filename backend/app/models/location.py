from datetime import datetime
from app.extensions import db
from app.models.base import BaseModel

class Location(BaseModel):
    __tablename__ = "locations"


    id = db.Column(db.Integer, primary_key=True)
    warehouse_id = db.Column(db.Integer, db.ForeignKey("warehouses.id"), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    rack_number = db.Column(db.String(50), nullable=True)
    capacity = db.Column(db.Float, default=0.0, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    warehouse = db.relationship("Warehouse", back_populates="locations")
    stocks = db.relationship("Stock", back_populates="location", lazy="dynamic")

    def to_dict(self):
        return {
            "id": self.id,
            "warehouse_id": self.warehouse_id,
            "warehouse_name": self.warehouse.name if self.warehouse else None,
            "name": self.name,
            "rack_number": self.rack_number,
            "capacity": self.capacity,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
