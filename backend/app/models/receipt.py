from datetime import datetime
from app.extensions import db
from app.models.base import BaseModel

class Receipt(BaseModel):
    __tablename__ = "receipts"


    id = db.Column(db.Integer, primary_key=True)
    receipt_number = db.Column(db.String(50), unique=True, nullable=False, index=True)
    supplier_id = db.Column(db.Integer, db.ForeignKey("suppliers.id"), nullable=True)
    warehouse_id = db.Column(db.Integer, db.ForeignKey("warehouses.id"), nullable=False)
    status = db.Column(db.String(20), default="DRAFT", nullable=False)  # DRAFT, WAITING, READY, DONE, CANCELLED
    receipt_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    notes = db.Column(db.Text, nullable=True)
    created_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    supplier = db.relationship("Supplier", back_populates="receipts")
    warehouse = db.relationship("Warehouse")
    creator = db.relationship("User")
    items = db.relationship("ReceiptItem", back_populates="receipt", cascade="all, delete-orphan", lazy="joined")

    STATUS_CHOICES = ["DRAFT", "WAITING", "READY", "DONE", "CANCELLED"]

    def to_dict(self):
        return {
            "id": self.id,
            "receipt_number": self.receipt_number,
            "supplier_id": self.supplier_id,
            "supplier_name": self.supplier.name if self.supplier else None,
            "warehouse_id": self.warehouse_id,
            "warehouse_name": self.warehouse.name if self.warehouse else None,
            "status": self.status,
            "receipt_date": self.receipt_date.isoformat() if self.receipt_date else None,
            "notes": self.notes,
            "created_by": self.created_by,
            "creator_name": self.creator.name if self.creator else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "items": [item.to_dict() for item in self.items],
        }

class ReceiptItem(BaseModel):
    __tablename__ = "receipt_items"

    id = db.Column(db.Integer, primary_key=True)
    receipt_id = db.Column(db.Integer, db.ForeignKey("receipts.id"), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    location_id = db.Column(db.Integer, db.ForeignKey("locations.id"), nullable=True)

    receipt = db.relationship("Receipt", back_populates="items")
    product = db.relationship("Product")
    location = db.relationship("Location")

    def to_dict(self):
        return {
            "id": self.id,
            "receipt_id": self.receipt_id,
            "product_id": self.product_id,
            "product_name": self.product.name if self.product else None,
            "product_sku": self.product.sku if self.product else None,
            "unit_of_measure": self.product.unit_of_measure if self.product else None,
            "quantity": self.quantity,
            "location_id": self.location_id,
            "location_name": self.location.name if self.location else None,
        }
