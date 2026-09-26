from datetime import datetime
from app.extensions import db
from app.models.transfer import Transfer
from app.models.product import Product
from app.models.warehouse import Warehouse
from app.models.location import Location
from app.models.stock import Stock
from app.services.inventory_service import InventoryService
from app.services.ledger_service import LedgerService
from app.services.notification_service import NotificationService
from app.utils.helpers import paginate, generate_reference_number

class TransferService:
    @staticmethod
    def get_all(status: str | None = None, page: int = 1, limit: int = 20):
        query = Transfer.query
        if status:
            query = query.filter(Transfer.status == status.upper())
        query = query.order_by(Transfer.created_at.desc())

        result = paginate(query, page, limit)
        return {
            "items": [t.to_dict() for t in result["items"]],
            "pagination": result["pagination"],
        }

    @staticmethod
    def get_by_id(transfer_id: int) -> dict:
        transfer = Transfer.query.get(transfer_id)
        if not transfer:
            raise ValueError("Transfer not found.")
        return transfer.to_dict()

    @staticmethod
    def create(data: dict, user_id: int | None = None) -> dict:
        product_id = data["product_id"]
        product = Product.query.get(product_id)
        if not product or product.is_deleted:
            raise ValueError("Product not found or is deleted.")

        source_wh = Warehouse.query.get(data["source_warehouse_id"])
        dest_wh = Warehouse.query.get(data["destination_warehouse_id"])
        if not source_wh or not dest_wh:
            raise ValueError("Invalid source or destination warehouse.")

        source_loc = Location.query.get(data["source_location_id"])
        dest_loc = Location.query.get(data["destination_location_id"])
        if not source_loc or not dest_loc:
            raise ValueError("Invalid source or destination location.")

        if source_loc.id == dest_loc.id:
            raise ValueError("Source and destination locations cannot be identical.")

        transfer_number = generate_reference_number("TRF")

        transfer = Transfer(
            transfer_number=transfer_number,
            product_id=product_id,
            quantity=float(data["quantity"]),
            source_warehouse_id=data["source_warehouse_id"],
            source_location_id=data["source_location_id"],
            destination_warehouse_id=data["destination_warehouse_id"],
            destination_location_id=data["destination_location_id"],
            status="DRAFT",
            notes=data.get("notes"),
            created_by=user_id,
        )
        db.session.add(transfer)
        db.session.commit()
        return transfer.to_dict()

    @staticmethod
    def update(transfer_id: int, data: dict) -> dict:
        transfer = Transfer.query.get(transfer_id)
        if not transfer:
            raise ValueError("Transfer not found.")

        if transfer.status in ["DONE", "CANCELLED"]:
            raise ValueError(f"Cannot edit transfer with status '{transfer.status}'.")

        if "notes" in data:
            transfer.notes = data["notes"]
        if "status" in data:
            transfer.status = data["status"]

        db.session.commit()
        return transfer.to_dict()

    @staticmethod
    def validate_transfer(transfer_id: int, user_id: int | None = None) -> dict:
        """
        Validate internal stock transfer:
        1. Source stock decreases.
        2. Destination stock increases.
        3. Create TRANSFER_OUT ledger for source.
        4. Create TRANSFER_IN ledger for destination.
        5. Does not change total company stock.
        6. Commit atomically.
        """
        transfer = Transfer.query.get(transfer_id)
        if not transfer:
            raise ValueError("Transfer not found.")

        if transfer.status == "DONE":
            raise ValueError("Transfer has already been completed.")
        if transfer.status == "CANCELLED":
            raise ValueError("Cannot validate a cancelled transfer.")

        try:
            # Source stock verification
            source_stock = Stock.query.filter_by(
                product_id=transfer.product_id,
                location_id=transfer.source_location_id,
            ).first()

            available_source_qty = source_stock.quantity if source_stock else 0.0
            if available_source_qty < transfer.quantity:
                raise ValueError(
                    f"Insufficient stock in source location. Available: {available_source_qty}, Required: {transfer.quantity}"
                )

            # Destination stock lookup / initialization
            dest_stock = InventoryService.get_or_create_stock(
                product_id=transfer.product_id,
                warehouse_id=transfer.destination_warehouse_id,
                location_id=transfer.destination_location_id,
            )

            # Update source stock
            assert source_stock is not None
            src_prev = source_stock.quantity

            src_new = src_prev - transfer.quantity
            source_stock.quantity = src_new
            source_stock.updated_at = datetime.utcnow()

            # Record TRANSFER_OUT ledger
            LedgerService.record_entry(
                product_id=transfer.product_id,
                warehouse_id=transfer.source_warehouse_id,
                location_id=transfer.source_location_id,
                transaction_type="TRANSFER_OUT",
                quantity=-transfer.quantity,
                reference_id=transfer.transfer_number,
                previous_quantity=src_prev,
                new_quantity=src_new,
                created_by=user_id,
            )

            # Update destination stock
            dest_prev = dest_stock.quantity
            dest_new = dest_prev + transfer.quantity
            dest_stock.quantity = dest_new
            dest_stock.updated_at = datetime.utcnow()

            # Record TRANSFER_IN ledger
            LedgerService.record_entry(
                product_id=transfer.product_id,
                warehouse_id=transfer.destination_warehouse_id,
                location_id=transfer.destination_location_id,
                transaction_type="TRANSFER_IN",
                quantity=transfer.quantity,
                reference_id=transfer.transfer_number,
                previous_quantity=dest_prev,
                new_quantity=dest_new,
                created_by=user_id,
            )

            transfer.status = "DONE"

            # Create notification
            NotificationService.create_notification(
                title=f"Stock Transfer Completed: {transfer.transfer_number}",
                message=(
                    f"Transferred {transfer.quantity} units of product ID {transfer.product_id} "
                    f"from {transfer.source_warehouse.name} to {transfer.destination_warehouse.name}."
                ),
                notification_type="OPERATION",
                user_id=user_id,
            )

            db.session.commit()
            return transfer.to_dict()

        except Exception as e:
            db.session.rollback()
            raise e
