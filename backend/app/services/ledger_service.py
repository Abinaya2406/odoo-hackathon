from datetime import datetime
from app.extensions import db
from app.models.stock_ledger import StockLedger
from app.utils.helpers import paginate
from app.utils.validators import validate_date

class LedgerService:
    @staticmethod
    def record_entry(
        product_id: int,
        warehouse_id: int,
        location_id: int,
        transaction_type: str,
        quantity: float,
        reference_id: str | None,
        previous_quantity: float,
        new_quantity: float,
        created_by: int | None = None,
    ) -> StockLedger:
        """
        Record a stock ledger entry.
        Note: caller must commit the transaction when all atomic operations finish.
        """
        entry = StockLedger(
            product_id=product_id,
            warehouse_id=warehouse_id,
            location_id=location_id,
            transaction_type=transaction_type,
            quantity=quantity,
            reference_id=reference_id,
            previous_quantity=previous_quantity,
            new_quantity=new_quantity,
            created_by=created_by,
            created_at=datetime.utcnow(),
        )
        db.session.add(entry)
        return entry

    @staticmethod
    def get_ledger(
        product_id: int | None = None,
        warehouse_id: int | None = None,
        location_id: int | None = None,
        transaction_type: str | None = None,
        start_date: str | None = None,
        end_date: str | None = None,
        page: int = 1,
        limit: int = 20,
    ):
        query = StockLedger.query

        if product_id:
            query = query.filter(StockLedger.product_id == product_id)
        if warehouse_id:
            query = query.filter(StockLedger.warehouse_id == warehouse_id)
        if location_id:
            query = query.filter(StockLedger.location_id == location_id)
        if transaction_type:
            query = query.filter(StockLedger.transaction_type == transaction_type.upper())

        parsed_start = validate_date(start_date) if start_date else None
        if parsed_start:
            query = query.filter(StockLedger.created_at >= parsed_start)

        parsed_end = validate_date(end_date) if end_date else None
        if parsed_end:
            query = query.filter(StockLedger.created_at <= parsed_end)

        query = query.order_by(StockLedger.created_at.desc(), StockLedger.id.desc())
        result = paginate(query, page, limit)

        return {
            "items": [item.to_dict() for item in result["items"]],
            "pagination": result["pagination"],
        }

    @staticmethod
    def get_product_history(product_id: int):
        """Return complete stock history for a product."""
        entries = (
            StockLedger.query.filter_by(product_id=product_id)
            .order_by(StockLedger.created_at.desc(), StockLedger.id.desc())
            .all()
        )
        return [entry.to_dict() for entry in entries]
