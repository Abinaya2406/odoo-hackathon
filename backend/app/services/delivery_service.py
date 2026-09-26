from datetime import datetime
from app.extensions import db
from app.models.delivery import Delivery, DeliveryItem
from app.models.product import Product
from app.models.warehouse import Warehouse
from app.models.location import Location
from app.models.stock import Stock
from app.services.ledger_service import LedgerService
from app.services.notification_service import NotificationService
from app.utils.helpers import paginate, generate_reference_number

class InsufficientStockError(Exception):
    """Custom exception raised when available stock is less than required delivery quantity."""
    pass

class DeliveryService:
    @staticmethod
    def get_all(status: str | None = None, warehouse_id: int | None = None, page: int = 1, limit: int = 20):
        query = Delivery.query
        if status:
            query = query.filter(Delivery.status == status.upper())
        if warehouse_id:
            query = query.filter(Delivery.warehouse_id == warehouse_id)

        query = query.order_by(Delivery.created_at.desc())
        result = paginate(query, page, limit)
        return {
            "items": [d.to_dict() for d in result["items"]],
            "pagination": result["pagination"],
        }

    @staticmethod
    def get_by_id(delivery_id: int) -> dict:
        delivery = Delivery.query.get(delivery_id)
        if not delivery:
            raise ValueError("Delivery not found.")
        return delivery.to_dict()

    @staticmethod
    def create(data: dict, user_id: int | None = None) -> dict:
        warehouse_id = data["warehouse_id"]
        warehouse = Warehouse.query.get(warehouse_id)
        if not warehouse:
            raise ValueError("Warehouse not found.")

        items = data.get("items", [])
        if not items:
            raise ValueError("Delivery must contain at least one item.")

        delivery_number = generate_reference_number("DEL")

        delivery = Delivery(
            delivery_number=delivery_number,
            customer_name=data["customer_name"].strip(),
            warehouse_id=warehouse_id,
            status="DRAFT",
            notes=data.get("notes"),
            delivery_date=data.get("delivery_date") or datetime.utcnow(),
            created_by=user_id,
        )
        db.session.add(delivery)
        db.session.flush()

        default_location = Location.query.filter_by(warehouse_id=warehouse_id).first()

        for item_data in items:
            product = Product.query.get(item_data["product_id"])
            if not product or product.is_deleted:
                raise ValueError(f"Product ID {item_data['product_id']} not found or is deleted.")

            location_id = item_data.get("location_id") or (default_location.id if default_location else None)

            item = DeliveryItem(
                delivery_id=delivery.id,
                product_id=product.id,
                quantity=float(item_data["quantity"]),
                location_id=location_id,
            )
            db.session.add(item)

        db.session.commit()
        return delivery.to_dict()

    @staticmethod
    def update(delivery_id: int, data: dict) -> dict:
        delivery = Delivery.query.get(delivery_id)
        if not delivery:
            raise ValueError("Delivery not found.")

        if delivery.status in ["DONE", "CANCELLED"]:
            raise ValueError(f"Cannot update delivery with status '{delivery.status}'.")

        if "customer_name" in data:
            delivery.customer_name = data["customer_name"].strip()
        if "notes" in data:
            delivery.notes = data["notes"]
        if "status" in data:
            delivery.status = data["status"]

        if "items" in data:
            DeliveryItem.query.filter_by(delivery_id=delivery.id).delete()
            default_location = Location.query.filter_by(warehouse_id=delivery.warehouse_id).first()
            for item_data in data["items"]:
                location_id = item_data.get("location_id") or (default_location.id if default_location else None)
                item = DeliveryItem(
                    delivery_id=delivery.id,
                    product_id=item_data["product_id"],
                    quantity=float(item_data["quantity"]),
                    location_id=location_id,
                )
                db.session.add(item)

        db.session.commit()
        return delivery.to_dict()

    @staticmethod
    def delete(delivery_id: int) -> bool:
        delivery = Delivery.query.get(delivery_id)
        if not delivery:
            raise ValueError("Delivery not found.")
        if delivery.status == "DONE":
            raise ValueError("Cannot delete a completed (DONE) delivery.")

        db.session.delete(delivery)
        db.session.commit()
        return True

    @staticmethod
    def validate_delivery(delivery_id: int, user_id: int | None = None) -> dict:
        """
        Validate delivery transactionally:
        1. Check status.
        2. Check whether sufficient stock exists. If insufficient: raise InsufficientStockError.
        3. Decrease stock.
        4. Create ledger entry.
        5. Mark delivery DONE.
        6. Create required notification.
        7. Commit transaction.
        """
        delivery = Delivery.query.get(delivery_id)
        if not delivery:
            raise ValueError("Delivery not found.")

        if delivery.status == "DONE":
            raise ValueError("Delivery has already been validated and processed.")
        if delivery.status == "CANCELLED":
            raise ValueError("Cannot validate a cancelled delivery.")

        if not delivery.items:
            raise ValueError("Delivery has no items to process.")

        try:
            # Phase 1: Pre-check stock availability for all items in the delivery
            items_to_process = []
            for item in delivery.items:
                product = Product.query.get(item.product_id)
                if not product or product.is_deleted:
                    raise ValueError(f"Product ID {item.product_id} is unavailable or deleted.")

                # If location is specified, check stock at that location; otherwise find stock in warehouse
                if item.location_id:
                    stock = Stock.query.filter_by(
                        product_id=item.product_id,
                        warehouse_id=delivery.warehouse_id,
                        location_id=item.location_id
                    ).first()
                else:
                    # Find stock in any location of this warehouse with sufficient quantity
                    stock = Stock.query.filter_by(
                        product_id=item.product_id,
                        warehouse_id=delivery.warehouse_id
                    ).order_by(Stock.quantity.desc()).first()

                available_qty = stock.quantity if stock else 0.0
                if available_qty < item.quantity:
                    raise InsufficientStockError(
                        f"Insufficient stock for product '{product.name}' (SKU: {product.sku}). "
                        f"Available: {available_qty}, Required: {item.quantity}"
                    )

                items_to_process.append((item, stock, product))

            # Phase 2: Execute deductions and record ledger atomically
            for item, stock, product in items_to_process:
                previous_quantity = stock.quantity
                new_quantity = previous_quantity - item.quantity

                # Rule 1: Stock can never become negative
                if new_quantity < 0:
                    raise InsufficientStockError("Insufficient stock.")

                stock.quantity = new_quantity
                stock.updated_at = datetime.utcnow()

                # Rule 7: Create ledger entry
                LedgerService.record_entry(
                    product_id=item.product_id,
                    warehouse_id=delivery.warehouse_id,
                    location_id=stock.location_id,
                    transaction_type="DELIVERY",
                    quantity=item.quantity,
                    reference_id=delivery.delivery_number,
                    previous_quantity=previous_quantity,
                    new_quantity=new_quantity,
                    created_by=user_id,
                )

                # Check if total product stock has dropped below minimum or reached 0
                remaining_total = product.total_stock
                if remaining_total <= 0:
                    NotificationService.notify_out_of_stock(product)
                elif remaining_total <= product.minimum_stock:
                    NotificationService.notify_low_stock(product, remaining_total)

            delivery.status = "DONE"

            # Create notification
            NotificationService.create_notification(
                title=f"Delivery Dispatched: {delivery.delivery_number}",
                message=f"Delivery {delivery.delivery_number} for customer '{delivery.customer_name}' dispatched.",
                notification_type="OPERATION",
                user_id=user_id,
            )

            db.session.commit()
            return delivery.to_dict()

        except Exception as e:
            db.session.rollback()
            raise e
