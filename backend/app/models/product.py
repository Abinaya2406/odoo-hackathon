from datetime import datetime
from app.extensions import db
from app.models.base import BaseModel

class Product(BaseModel):
    __tablename__ = "products"


    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False, index=True)
    sku = db.Column(db.String(100), unique=True, nullable=False, index=True)
    category_id = db.Column(db.Integer, db.ForeignKey("categories.id"), nullable=True)
    supplier_id = db.Column(db.Integer, db.ForeignKey("suppliers.id"), nullable=True)
    unit_of_measure = db.Column(db.String(50), nullable=False, default="units")
    minimum_stock = db.Column(db.Float, default=10.0, nullable=False)
    maximum_stock = db.Column(db.Float, default=1000.0, nullable=False)
    reorder_quantity = db.Column(db.Float, default=50.0, nullable=False)
    cost_price = db.Column(db.Float, default=0.0, nullable=False)
    is_deleted = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    category = db.relationship("Category", back_populates="products")
    supplier = db.relationship("Supplier", back_populates="products")
    stocks = db.relationship("Stock", back_populates="product", lazy="dynamic")

    @property
    def total_stock(self) -> float:
        """Calculate total stock across all locations."""
        return sum(s.quantity for s in self.stocks)

    @property
    def stock_status(self) -> str:
        """Returns IN_STOCK, LOW_STOCK, or OUT_OF_STOCK."""
        total = self.total_stock
        if total <= 0:
            return "OUT_OF_STOCK"
        elif total <= self.minimum_stock:
            return "LOW_STOCK"
        return "IN_STOCK"

    def to_dict(self, include_stock=True):
        data = {
            "id": self.id,
            "name": self.name,
            "sku": self.sku,
            "category_id": self.category_id,
            "category_name": self.category.name if self.category else None,
            "supplier_id": self.supplier_id,
            "supplier_name": self.supplier.name if self.supplier else None,
            "unit_of_measure": self.unit_of_measure,
            "minimum_stock": self.minimum_stock,
            "maximum_stock": self.maximum_stock,
            "reorder_quantity": self.reorder_quantity,
            "cost_price": self.cost_price,
            "is_deleted": self.is_deleted,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_stock:
            data["total_stock"] = self.total_stock
            data["stock_status"] = self.stock_status
        return data
