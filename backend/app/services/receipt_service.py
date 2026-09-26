from datetime import datetime
from app.extensions import db
from app.models.receipt import Receipt, ReceiptItem
from app.models.product import Product
from app.models.warehouse import Warehouse
from app.models.location import Location
from app.services.inventory_service import InventoryService
from app.services.ledger_service import LedgerService
from app.services.notification_service import NotificationService
from app.utils.helpers import paginate, generate_reference_number

class ReceiptService:
    @staticmethod
    def get_all(status: str | None = None, warehouse_id: int | None = None, page: int = 1, limit: int = 20):
        query = Receipt.query
        if status:
            query = query.filter(Receipt.status == status.upper())
        if warehouse_id:
            query = query.filter(Receipt.warehouse_id == warehouse_id)

        query = query.order_by(Receipt.created_at.desc())
        result = paginate(query, page, limit)
        return {
            "items": [r.to_dict() for r in result["items"]],
            "pagination": result["pagination"],
        }

    @staticmethod
    def get_by_id(receipt_id: int) -> dict:
        receipt = Receipt.query.get(receipt_id)
        if not receipt:
            raise ValueError("Receipt not found.")
        return receipt.to_dict()

    @staticmethod
    def create(data: dict, user_id: int | None = None) -> dict:
        warehouse_id = data["warehouse_id"]
        warehouse = Warehouse.query.get(warehouse_id)
        if not warehouse:
            raise ValueError("Warehouse not found.")

        receipt_number = generate_reference_number("REC")

        receipt = Receipt(
            receipt_number=receipt_number,
            supplier_id=data.get("supplier_id"),
            warehouse_id=warehouse_id,
            status="DRAFT",
            notes=data.get("notes"),
            receipt_date=data.get("receipt_date") or datetime.utcnow(),
            created_by=user_id,
        )
        db.session.add(receipt)
        db.session.flush()

        # Add items
        items = data.get("items", [])
        if not items:
            raise ValueError("Receipt must contain at least one item.")

        default_location = Location.query.filter_by(warehouse_id=warehouse_id).first()

        for item_data in items:
            product = Product.query.get(item_data["product_id"])
            if not product or product.is_deleted:
                raise ValueError(f"Product ID {item_data['product_id']} not found or is deleted.")

            location_id = item_data.get("location_id")
            if not location_id:
                if not default_location:
                    raise ValueError(f"Warehouse ID {warehouse_id} has no locations configured.")
                location_id = default_location.id

            item = ReceiptItem(
                receipt_id=receipt.id,
                product_id=product.id,
                quantity=float(item_data["quantity"]),
                location_id=location_id,
            )
            db.session.add(item)

        db.session.commit()
        return receipt.to_dict()

    @staticmethod
    def update(receipt_id: int, data: dict) -> dict:
        receipt = Receipt.query.get(receipt_id)
        if not receipt:
            raise ValueError("Receipt not found.")

        if receipt.status in ["DONE", "CANCELLED"]:
            raise ValueError(f"Cannot update receipt with status '{receipt.status}'.")

        if "supplier_id" in data:
            receipt.supplier_id = data["supplier_id"]
        if "notes" in data:
            receipt.notes = data["notes"]
        if "status" in data:
            receipt.status = data["status"]

        if "items" in data:
            # Clear old items and add updated items
            ReceiptItem.query.filter_by(receipt_id=receipt.id).delete()
            default_location = Location.query.filter_by(warehouse_id=receipt.warehouse_id).first()
            for item_data in data["items"]:
                location_id = item_data.get("location_id") or (default_location.id if default_location else None)
                item = ReceiptItem(
                    receipt_id=receipt.id,
                    product_id=item_data["product_id"],
                    quantity=float(item_data["quantity"]),
                    location_id=location_id,
                )
                db.session.add(item)

        db.session.commit()
        return receipt.to_dict()

    @staticmethod
    def delete(receipt_id: int) -> bool:
        receipt = Receipt.query.get(receipt_id)
        if not receipt:
            raise ValueError("Receipt not found.")
        if receipt.status == "DONE":
            raise ValueError("Cannot delete a completed (DONE) receipt.")

        db.session.delete(receipt)
        db.session.commit()
        return True

    @staticmethod
    def validate_receipt(receipt_id: int, user_id: int | None = None) -> dict:
        """
        Validate receipt transactionally:
        1. Check status (must be DRAFT, WAITING, or READY).
        2. Validate quantities.
        3. Increase stock.
        4. Create STOCK_LEDGER entry.
        5. Change receipt status to DONE.
        6. Commit everything as one atomic database transaction.
        """
        receipt = Receipt.query.get(receipt_id)
        if not receipt:
            raise ValueError("Receipt not found.")

        if receipt.status == "DONE":
            raise ValueError("Receipt has already been validated and processed.")
        if receipt.status == "CANCELLED":
            raise ValueError("Cannot validate a cancelled receipt.")

        if not receipt.items:
            raise ValueError("Receipt has no items to process.")

        try:
            for item in receipt.items:
                if item.quantity <= 0:
                    raise ValueError(f"Invalid quantity {item.quantity} for product ID {item.product_id}.")

                # Get location
                location_id = item.location_id
                if not location_id:
                    default_loc = Location.query.filter_by(warehouse_id=receipt.warehouse_id).first()
                    if not default_loc:
                        raise ValueError(f"Warehouse ID {receipt.warehouse_id} has no location configured.")
                    location_id = default_loc.id
                    item.location_id = location_id

                # Fetch or initialize stock record
                stock = InventoryService.get_or_create_stock(
                    product_id=item.product_id,
                    warehouse_id=receipt.warehouse_id,
                    location_id=location_id,
                )

                previous_quantity = stock.quantity
                new_quantity = previous_quantity + item.quantity

                # Rule 3: Receipt validation increases stock
                stock.quantity = new_quantity
                stock.updated_at = datetime.utcnow()

                # Rule 7: Every stock-changing operation creates a ledger record
                LedgerService.record_entry(
                    product_id=item.product_id,
                    warehouse_id=receipt.warehouse_id,
                    location_id=location_id,
                    transaction_type="RECEIPT",
                    quantity=item.quantity,
                    reference_id=receipt.receipt_number,
                    previous_quantity=previous_quantity,
                    new_quantity=new_quantity,
                    created_by=user_id,
                )

            # Change status to DONE
            receipt.status = "DONE"

            # Create notification
            NotificationService.create_notification(
                title=f"Receipt Validated: {receipt.receipt_number}",
                message=f"Receipt {receipt.receipt_number} with {len(receipt.items)} items received into inventory.",
                notification_type="OPERATION",
                user_id=user_id,
            )

            db.session.commit()
            return receipt.to_dict()

        except Exception as e:
            db.session.rollback()
            raise e
