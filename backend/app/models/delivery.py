from datetime import datetime
from app.extensions import db
from app.models.base import BaseModel

class Delivery(BaseModel):
    __tablename__ = "deliveries"


    id = db.Column(db.Integer, primary_key=True)
    delivery_number = db.Column(db.String(50), unique=True, nullable=False, index=True)
    customer_name = db.Column(db.String(150), nullable=False)
    warehouse_id = db.Column(db.Integer, db.ForeignKey("warehouses.id"), nullable=False)
    status = db.Column(db.String(20), default="DRAFT", nullable=False)  # DRAFT, WAITING, READY, DONE, CANCELLED
    delivery_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    notes = db.Column(db.Text, nullable=True)
    created_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    warehouse = db.relationship("Warehouse")
    creator = db.relationship("User")
    items = db.relationship("DeliveryItem", back_populates="delivery", cascade="all, delete-orphan", lazy="joined")

    STATUS_CHOICES = ["DRAFT", "WAITING", "READY", "DONE", "CANCELLED"]

    def to_dict(self):
        return {
            "id": self.id,
            "delivery_number": self.delivery_number,
            "customer_name": self.customer_name,
            "warehouse_id": self.warehouse_id,
            "warehouse_name": self.warehouse.name if self.warehouse else None,
            "status": self.status,
            "delivery_date": self.delivery_date.isoformat() if self.delivery_date else None,
            "notes": self.notes,
            "created_by": self.created_by,
            "creator_name": self.creator.name if self.creator else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "items": [item.to_dict() for item in self.items],
        }

class DeliveryItem(BaseModel):
    __tablename__ = "delivery_items"

    id = db.Column(db.Integer, primary_key=True)
    delivery_id = db.Column(db.Integer, db.ForeignKey("deliveries.id"), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    location_id = db.Column(db.Integer, db.ForeignKey("locations.id"), nullable=True)

    delivery = db.relationship("Delivery", back_populates="items")
    product = db.relationship("Product")
    location = db.relationship("Location")

    def to_dict(self):
        return {
            "id": self.id,
            "delivery_id": self.delivery_id,
            "product_id": self.product_id,
            "product_name": self.product.name if self.product else None,
            "product_sku": self.product.sku if self.product else None,
            "unit_of_measure": self.product.unit_of_measure if self.product else None,
            "quantity": self.quantity,
            "location_id": self.location_id,
            "location_name": self.location.name if self.location else None,
        }
