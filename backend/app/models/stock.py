from datetime import datetime
from app.extensions import db
from app.models.base import BaseModel

class Stock(BaseModel):
    __tablename__ = "stocks"


    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)
    warehouse_id = db.Column(db.Integer, db.ForeignKey("warehouses.id"), nullable=False)
    location_id = db.Column(db.Integer, db.ForeignKey("locations.id"), nullable=False)
    quantity = db.Column(db.Float, default=0.0, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        db.UniqueConstraint("product_id", "location_id", name="uq_product_location"),
        db.CheckConstraint("quantity >= 0", name="chk_stock_non_negative"),
    )

    product = db.relationship("Product", back_populates="stocks")
    warehouse = db.relationship("Warehouse", back_populates="stocks")
    location = db.relationship("Location", back_populates="stocks")

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
            "quantity": self.quantity,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
