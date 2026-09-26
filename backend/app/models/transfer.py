from datetime import datetime
from app.extensions import db
from app.models.base import BaseModel

class Transfer(BaseModel):
    __tablename__ = "transfers"


    id = db.Column(db.Integer, primary_key=True)
    transfer_number = db.Column(db.String(50), unique=True, nullable=False, index=True)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    source_warehouse_id = db.Column(db.Integer, db.ForeignKey("warehouses.id"), nullable=False)
    source_location_id = db.Column(db.Integer, db.ForeignKey("locations.id"), nullable=False)
    destination_warehouse_id = db.Column(db.Integer, db.ForeignKey("warehouses.id"), nullable=False)
    destination_location_id = db.Column(db.Integer, db.ForeignKey("locations.id"), nullable=False)
    status = db.Column(db.String(20), default="DRAFT", nullable=False)  # DRAFT, READY, DONE, CANCELLED
    notes = db.Column(db.Text, nullable=True)
    created_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    product = db.relationship("Product")
    source_warehouse = db.relationship("Warehouse", foreign_keys=[source_warehouse_id])
    source_location = db.relationship("Location", foreign_keys=[source_location_id])
    destination_warehouse = db.relationship("Warehouse", foreign_keys=[destination_warehouse_id])
    destination_location = db.relationship("Location", foreign_keys=[destination_location_id])
    creator = db.relationship("User")

    STATUS_CHOICES = ["DRAFT", "READY", "DONE", "CANCELLED"]

    def to_dict(self):
        return {
            "id": self.id,
            "transfer_number": self.transfer_number,
            "product_id": self.product_id,
            "product_name": self.product.name if self.product else None,
            "product_sku": self.product.sku if self.product else None,
            "quantity": self.quantity,
            "source_warehouse_id": self.source_warehouse_id,
            "source_warehouse_name": self.source_warehouse.name if self.source_warehouse else None,
            "source_location_id": self.source_location_id,
            "source_location_name": self.source_location.name if self.source_location else None,
            "destination_warehouse_id": self.destination_warehouse_id,
            "destination_warehouse_name": self.destination_warehouse.name if self.destination_warehouse else None,
            "destination_location_id": self.destination_location_id,
            "destination_location_name": self.destination_location.name if self.destination_location else None,
            "status": self.status,
            "notes": self.notes,
            "created_by": self.created_by,
            "creator_name": self.creator.name if self.creator else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
