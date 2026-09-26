from datetime import datetime
from app.extensions import db
from app.models.base import BaseModel

class Adjustment(BaseModel):
    __tablename__ = "adjustments"


    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)
    warehouse_id = db.Column(db.Integer, db.ForeignKey("warehouses.id"), nullable=False)
    location_id = db.Column(db.Integer, db.ForeignKey("locations.id"), nullable=False)
    system_quantity = db.Column(db.Float, nullable=False)
    physical_quantity = db.Column(db.Float, nullable=False)
    difference = db.Column(db.Float, nullable=False)  # physical_quantity - system_quantity
    reason = db.Column(db.String(255), nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    product = db.relationship("Product")
    warehouse = db.relationship("Warehouse")
    location = db.relationship("Location")
    creator = db.relationship("User")

    def to_dict(self):
        return {
            "id": self.id,
            "product_id": self.product_id,
            "product_name": self.product.name if self.product else None,
            "product_sku": self.product.sku if self.product else None,
            "warehouse_id": self.warehouse_id,
            "warehouse_name": self.warehouse.name if self.warehouse else None,
            "location_id": self.location_id,
            "location_name": self.location.name if self.location else None,
            "rack_number": self.location.rack_number if self.location else None,
            "system_quantity": self.system_quantity,
            "physical_quantity": self.physical_quantity,
            "difference": self.difference,
            "reason": self.reason,
            "created_by": self.created_by,
            "creator_name": self.creator.name if self.creator else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
