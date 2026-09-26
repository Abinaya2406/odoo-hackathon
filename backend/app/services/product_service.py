from sqlalchemy import or_, desc, asc
from app.extensions import db
from app.models.product import Product
from app.models.category import Category
from app.models.stock import Stock
from app.utils.helpers import paginate

class ProductService:
    # --- Category Management ---
    @staticmethod
    def get_categories():
        categories = Category.query.filter_by(is_deleted=False).order_by(Category.name.asc()).all()
        return [c.to_dict() for c in categories]

    @staticmethod
    def create_category(data: dict):
        name = data["name"].strip()
        if Category.query.filter_by(name=name, is_deleted=False).first():
            raise ValueError(f"Category with name '{name}' already exists.")

        category = Category(
            name=name,
            description=data.get("description"),
            is_deleted=False,
        )
        db.session.add(category)
        db.session.commit()
        return category.to_dict()

    @staticmethod
    def update_category(category_id: int, data: dict):
        category = Category.query.get(category_id)
        if not category or category.is_deleted:
            raise ValueError("Category not found.")

        if "name" in data:
            new_name = data["name"].strip()
            existing = Category.query.filter(
                Category.name == new_name,
                Category.id != category_id,
                Category.is_deleted == False
            ).first()
            if existing:
                raise ValueError(f"Category '{new_name}' already exists.")
            category.name = new_name

        if "description" in data:
            category.description = data["description"]

        db.session.commit()
        return category.to_dict()

    @staticmethod
    def delete_category(category_id: int):
        category = Category.query.get(category_id)
        if not category or category.is_deleted:
            raise ValueError("Category not found.")

        # Check if category has active products
        active_products = Product.query.filter_by(category_id=category_id, is_deleted=False).count()
        if active_products > 0:
            raise ValueError(f"Cannot delete category: {active_products} active product(s) belong to it.")

        category.is_deleted = True
        db.session.commit()
        return True

    # --- Product Management ---
    @staticmethod
    def get_all(
        search: str | None = None,
        category_id: int | None = None,
        warehouse_id: int | None = None,
        stock_status: str | None = None,
        sort_by: str = "id",
        order: str = "asc",
        page: int = 1,
        limit: int = 20,
    ):
        query = Product.query.filter_by(is_deleted=False)

        # Search filter (name or sku)
        if search:
            search_term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Product.name.ilike(search_term),
                    Product.sku.ilike(search_term),
                )
            )

        # Category filter
        if category_id:
            query = query.filter(Product.category_id == category_id)

        # Warehouse filter
        if warehouse_id:
            query = query.join(Stock).filter(Stock.warehouse_id == warehouse_id)

        # Sorting
        sort_column = getattr(Product, sort_by, Product.id)
        if order.lower() == "desc":
            query = query.order_by(desc(sort_column))  # type: ignore
        else:
            query = query.order_by(asc(sort_column))  # type: ignore


        # We fetch paginated results
        result = paginate(query, page, limit)
        product_dicts = [p.to_dict(include_stock=True) for p in result["items"]]

        # Stock status filter in-memory if requested (or could be in SQL)
        if stock_status:
            status_upper = stock_status.upper()
            product_dicts = [p for p in product_dicts if p.get("stock_status") == status_upper]

        return {
            "items": product_dicts,
            "pagination": result["pagination"],
        }

    @staticmethod
    def get_by_id(product_id: int) -> dict:
        product = Product.query.get(product_id)
        if not product or product.is_deleted:
            raise ValueError("Product not found.")
        data = product.to_dict(include_stock=True)
        # Include breakdown by warehouse and location
        data["stock_breakdown"] = [s.to_dict() for s in product.stocks.all()]
        return data

    @staticmethod
    def create(data: dict) -> dict:
        sku = data["sku"].strip().upper()
        if Product.query.filter_by(sku=sku).first():
            raise ValueError(f"Product with SKU '{sku}' already exists.")

        product = Product(
            name=data["name"].strip(),
            sku=sku,
            category_id=data.get("category_id"),
            supplier_id=data.get("supplier_id"),
            unit_of_measure=data.get("unit_of_measure", "units"),
            minimum_stock=data.get("minimum_stock", 10.0),
            maximum_stock=data.get("maximum_stock", 1000.0),
            reorder_quantity=data.get("reorder_quantity", 50.0),
            cost_price=data.get("cost_price", 0.0),
            is_deleted=False,
        )
        db.session.add(product)
        db.session.commit()
        return product.to_dict()

    @staticmethod
    def update(product_id: int, data: dict) -> dict:
        product = Product.query.get(product_id)
        if not product or product.is_deleted:
            raise ValueError("Product not found.")

        if "sku" in data:
            new_sku = data["sku"].strip().upper()
            existing = Product.query.filter(
                Product.sku == new_sku,
                Product.id != product_id
            ).first()
            if existing:
                raise ValueError(f"Product with SKU '{new_sku}' already exists.")
            product.sku = new_sku

        if "name" in data:
            product.name = data["name"].strip()
        if "category_id" in data:
            product.category_id = data["category_id"]
        if "supplier_id" in data:
            product.supplier_id = data["supplier_id"]
        if "unit_of_measure" in data:
            product.unit_of_measure = data["unit_of_measure"]
        if "minimum_stock" in data:
            product.minimum_stock = data["minimum_stock"]
        if "maximum_stock" in data:
            product.maximum_stock = data["maximum_stock"]
        if "reorder_quantity" in data:
            product.reorder_quantity = data["reorder_quantity"]
        if "cost_price" in data:
            product.cost_price = data["cost_price"]

        db.session.commit()
        return product.to_dict(include_stock=True)

    @staticmethod
    def delete(product_id: int) -> bool:
        """Soft delete product to maintain historical ledger/transaction integrity."""
        product = Product.query.get(product_id)
        if not product or product.is_deleted:
            raise ValueError("Product not found.")

        product.is_deleted = True
        db.session.commit()
        return True
