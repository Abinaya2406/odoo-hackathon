from datetime import datetime
from app.extensions import db
from app.models.adjustment import Adjustment
from app.models.product import Product
from app.models.location import Location
from app.services.inventory_service import InventoryService
from app.services.ledger_service import LedgerService
from app.services.notification_service import NotificationService
from app.utils.helpers import paginate

class AdjustmentService:
    @staticmethod
    def get_all(product_id: int | None = None, warehouse_id: int | None = None, page: int = 1, limit: int = 20):
        query = Adjustment.query
        if product_id:
            query = query.filter(Adjustment.product_id == product_id)
        if warehouse_id:
            query = query.filter(Adjustment.warehouse_id == warehouse_id)

        query = query.order_by(Adjustment.created_at.desc())
        result = paginate(query, page, limit)
        return {
            "items": [a.to_dict() for a in result["items"]],
            "pagination": result["pagination"],
        }

    @staticmethod
    def get_by_id(adjustment_id: int) -> dict:
        adj = Adjustment.query.get(adjustment_id)
        if not adj:
            raise ValueError("Adjustment not found.")
        return adj.to_dict()

    @staticmethod
    def create(data: dict, user_id: int | None = None) -> dict:
        """
        Stock Adjustment:
        system_quantity = current database stock
        physical_quantity = user entered quantity
        difference = physical_quantity - system_quantity
        Update stock.
        Create ledger entry.
        Store adjustment reason.
        Atomic transaction.
        """
        product_id = data["product_id"]
        warehouse_id = data["warehouse_id"]
        location_id = data["location_id"]
        physical_quantity = float(data["physical_quantity"])
        reason = data["reason"].strip()

        if physical_quantity < 0:
            raise ValueError("Physical quantity cannot be negative.")

        product = Product.query.get(product_id)
        if not product or product.is_deleted:
            raise ValueError("Product not found or is deleted.")

        location = Location.query.get(location_id)
        if not location or location.warehouse_id != warehouse_id:
            raise ValueError(f"Location ID {location_id} does not match Warehouse ID {warehouse_id}.")

        try:
            # 1. Fetch current database stock
            stock = InventoryService.get_or_create_stock(
                product_id=product_id,
                warehouse_id=warehouse_id,
                location_id=location_id,
            )

            system_quantity = stock.quantity
            difference = physical_quantity - system_quantity

            # 2. Update stock to physical quantity
            stock.quantity = physical_quantity
            stock.updated_at = datetime.utcnow()

            # 3. Create adjustment record
            adjustment = Adjustment(
                product_id=product_id,
                warehouse_id=warehouse_id,
                location_id=location_id,
                system_quantity=system_quantity,
                physical_quantity=physical_quantity,
                difference=difference,
                reason=reason,
                created_by=user_id,
                created_at=datetime.utcnow(),
            )
            db.session.add(adjustment)
            db.session.flush()

            # 4. Create ledger entry
            LedgerService.record_entry(
                product_id=product_id,
                warehouse_id=warehouse_id,
                location_id=location_id,
                transaction_type="ADJUSTMENT",
                quantity=difference,
                reference_id=f"ADJ-{adjustment.id}",
                previous_quantity=system_quantity,
                new_quantity=physical_quantity,
                created_by=user_id,
            )

            # 5. Check if stock reached low or 0
            remaining_total = product.total_stock
            if remaining_total <= 0:
                NotificationService.notify_out_of_stock(product)
            elif remaining_total <= product.minimum_stock:
                NotificationService.notify_low_stock(product, remaining_total)

            db.session.commit()
            return adjustment.to_dict()

        except Exception as e:
            db.session.rollback()
            raise e
