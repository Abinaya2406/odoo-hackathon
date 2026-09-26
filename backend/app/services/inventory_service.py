from sqlalchemy import or_
from app.extensions import db
from app.models.product import Product
from app.models.warehouse import Warehouse
from app.models.location import Location
from app.models.stock import Stock
from app.utils.helpers import paginate

class InventoryService:
    @staticmethod
    def get_or_create_stock(product_id: int, warehouse_id: int, location_id: int) -> Stock:
        """Fetch stock record or create one with 0 initial quantity."""
        stock = Stock.query.filter_by(
            product_id=product_id,
            location_id=location_id
        ).first()

        if not stock:
            # Verify warehouse and location match
            location = Location.query.get(location_id)
            if not location or location.warehouse_id != warehouse_id:
                raise ValueError(f"Location ID {location_id} does not belong to Warehouse ID {warehouse_id}.")

            stock = Stock(
                product_id=product_id,
                warehouse_id=warehouse_id,
                location_id=location_id,
                quantity=0.0,
            )
            db.session.add(stock)
            db.session.flush()

        return stock

    @staticmethod
    def get_inventory(
        search: str | None = None,
        category_id: int | None = None,
        warehouse_id: int | None = None,
        low_stock_only: bool = False,
        out_of_stock_only: bool = False,
        page: int = 1,
        limit: int = 20,
    ):
        query = Product.query.filter_by(is_deleted=False)

        if search:
            search_term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Product.name.ilike(search_term),
                    Product.sku.ilike(search_term),
                )
            )

        if category_id:
            query = query.filter(Product.category_id == category_id)

        if warehouse_id:
            query = query.join(Stock).filter(Stock.warehouse_id == warehouse_id).distinct()

        # Fetch matching products
        all_products = query.order_by(Product.name.asc()).all()

        # Compute stock status and filter accordingly
        results = []
        for p in all_products:
            total_stock = p.total_stock
            status = p.stock_status

            if out_of_stock_only and status != "OUT_OF_STOCK":
                continue
            if low_stock_only and status != "LOW_STOCK":
                continue

            results.append({
                "product_id": p.id,
                "product_name": p.name,
                "sku": p.sku,
                "category_id": p.category_id,
                "category_name": p.category.name if p.category else None,
                "unit_of_measure": p.unit_of_measure,
                "minimum_stock": p.minimum_stock,
                "maximum_stock": p.maximum_stock,
                "reorder_quantity": p.reorder_quantity,
                "cost_price": p.cost_price,
                "total_stock": total_stock,
                "stock_status": status,
                "stock_breakdown": [
                    {
                        "stock_id": s.id,
                        "warehouse_id": s.warehouse_id,
                        "warehouse_name": s.warehouse.name if s.warehouse else None,
                        "location_id": s.location_id,
                        "location_name": s.location.name if s.location else None,
                        "rack_number": s.location.rack_number if s.location else None,
                        "quantity": s.quantity,
                    }
                    for s in p.stocks.all()
                ],
            })

        # Paginate in-memory
        total = len(results)
        pages = (total + limit - 1) // limit if limit > 0 else 1
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_items = results[start_idx:end_idx]

        return {
            "items": paginated_items,
            "pagination": {
                "total": total,
                "page": page,
                "limit": limit,
                "pages": pages,
                "has_next": page < pages,
                "has_prev": page > 1,
            },
        }

    @staticmethod
    def get_by_product(product_id: int):
        product = Product.query.get(product_id)
        if not product or product.is_deleted:
            raise ValueError("Product not found.")

        stocks = Stock.query.filter_by(product_id=product_id).all()
        return {
            "product_id": product.id,
            "product_name": product.name,
            "sku": product.sku,
            "total_stock": product.total_stock,
            "stock_status": product.stock_status,
            "minimum_stock": product.minimum_stock,
            "reorder_quantity": product.reorder_quantity,
            "locations": [s.to_dict() for s in stocks],
        }

    @staticmethod
    def get_by_warehouse(warehouse_id: int):
        warehouse = Warehouse.query.get(warehouse_id)
        if not warehouse:
            raise ValueError("Warehouse not found.")

        stocks = (
            Stock.query.filter_by(warehouse_id=warehouse_id)
            .join(Product)
            .filter(Product.is_deleted == False)
            .all()
        )

        return {
            "warehouse_id": warehouse.id,
            "warehouse_name": warehouse.name,
            "location": warehouse.location,
            "total_items_stored": sum(s.quantity for s in stocks),
            "stock": [s.to_dict() for s in stocks],
        }
