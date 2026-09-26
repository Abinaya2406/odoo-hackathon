from app.extensions import db
from app.models.warehouse import Warehouse
from app.models.location import Location
from app.models.supplier import Supplier
from app.utils.helpers import paginate

class WarehouseService:
    @staticmethod
    def get_all(page: int = 1, limit: int = 20):
        query = Warehouse.query.order_by(Warehouse.id.asc())
        result = paginate(query, page, limit)
        return {
            "items": [w.to_dict() for w in result["items"]],
            "pagination": result["pagination"],
        }

    @staticmethod
    def get_by_id(warehouse_id: int) -> dict:
        warehouse = Warehouse.query.get(warehouse_id)
        if not warehouse:
            raise ValueError("Warehouse not found.")
        data = warehouse.to_dict()
        data["locations"] = [loc.to_dict() for loc in warehouse.locations.all()]
        return data

    @staticmethod
    def create(data: dict) -> dict:
        warehouse = Warehouse(
            name=data["name"].strip(),
            location=data.get("location"),
            capacity=data.get("capacity", 0.0),
        )
        db.session.add(warehouse)
        db.session.flush()

        # Automatically create a default location for convenience
        default_location = Location(
            warehouse_id=warehouse.id,
            name="General Storage",
            rack_number="A-01",
            capacity=warehouse.capacity,
        )
        db.session.add(default_location)
        db.session.commit()
        return warehouse.to_dict()

    @staticmethod
    def update(warehouse_id: int, data: dict) -> dict:
        warehouse = Warehouse.query.get(warehouse_id)
        if not warehouse:
            raise ValueError("Warehouse not found.")

        if "name" in data:
            warehouse.name = data["name"].strip()
        if "location" in data:
            warehouse.location = data["location"]
        if "capacity" in data:
            warehouse.capacity = data["capacity"]
        if "is_active" in data:
            warehouse.is_active = data["is_active"]

        db.session.commit()
        return warehouse.to_dict()

    @staticmethod
    def delete(warehouse_id: int) -> bool:
        warehouse = Warehouse.query.get(warehouse_id)
        if not warehouse:
            raise ValueError("Warehouse not found.")

        # Check if warehouse has active stock
        total_stock = sum(s.quantity for s in warehouse.stocks.all())
        if total_stock > 0:
            raise ValueError("Cannot delete warehouse with active stock. Transfer or adjust stock first.")

        db.session.delete(warehouse)
        db.session.commit()
        return True

    @staticmethod
    def get_locations(warehouse_id: int) -> list[dict]:
        warehouse = Warehouse.query.get(warehouse_id)
        if not warehouse:
            raise ValueError("Warehouse not found.")
        locations = Location.query.filter_by(warehouse_id=warehouse_id).all()
        return [loc.to_dict() for loc in locations]

    @staticmethod
    def create_location(warehouse_id: int, data: dict) -> dict:
        warehouse = Warehouse.query.get(warehouse_id)
        if not warehouse:
            raise ValueError("Warehouse not found.")

        location = Location(
            warehouse_id=warehouse_id,
            name=data["name"].strip(),
            rack_number=data.get("rack_number"),
            capacity=data.get("capacity", 0.0),
        )
        db.session.add(location)
        db.session.commit()
        return location.to_dict()

    # Supplier helpers
    @staticmethod
    def get_suppliers() -> list[dict]:
        suppliers = Supplier.query.order_by(Supplier.name.asc()).all()
        return [s.to_dict() for s in suppliers]

    @staticmethod
    def create_supplier(data: dict) -> dict:
        supplier = Supplier(
            name=data["name"].strip(),
            email=data.get("email"),
            phone=data.get("phone"),
            address=data.get("address"),
        )
        db.session.add(supplier)
        db.session.commit()
        return supplier.to_dict()
