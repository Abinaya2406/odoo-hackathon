from datetime import datetime
from app.extensions import db
from app.models.base import BaseModel

class StockLedger(BaseModel):
    __tablename__ = "stock_ledger"


    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False, index=True)
    warehouse_id = db.Column(db.Integer, db.ForeignKey("warehouses.id"), nullable=False, index=True)
    location_id = db.Column(db.Integer, db.ForeignKey("locations.id"), nullable=False)
    transaction_type = db.Column(db.String(30), nullable=False, index=True)  # RECEIPT, DELIVERY, TRANSFER_IN, TRANSFER_OUT, ADJUSTMENT
    quantity = db.Column(db.Float, nullable=False)
    reference_id = db.Column(db.String(100), nullable=True)  # receipt_number, delivery_number, transfer_number, adjustment_id
    previous_quantity = db.Column(db.Float, nullable=False)
    new_quantity = db.Column(db.Float, nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)

    product = db.relationship("Product")
    warehouse = db.relationship("Warehouse")
    location = db.relationship("Location")
    creator = db.relationship("User")

    TRANSACTION_TYPES = [
        "RECEIPT",
        "DELIVERY",
        "TRANSFER_IN",
        "TRANSFER_OUT",
        "ADJUSTMENT",
    ]

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
            "transaction_type": self.transaction_type,
            "quantity": self.quantity,
            "reference_id": self.reference_id,
            "previous_quantity": self.previous_quantity,
            "new_quantity": self.new_quantity,
            "created_by": self.created_by,
            "creator_name": self.creator.name if self.creator else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
