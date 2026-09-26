import pytest
import sys
import os

# Add backend directory to sys.path so imports work smoothly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.warehouse import Warehouse
from app.models.location import Location
from app.models.category import Category
from app.models.product import Product
from app.models.stock import Stock

@pytest.fixture(scope="session")
def app():
    app = create_app("testing")
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()

@pytest.fixture(autouse=True)
def clean_db(app):
    """Clean all tables before each test to ensure complete isolation."""
    with app.app_context():
        # Clear data in dependency order
        for table in reversed(db.metadata.sorted_tables):
            db.session.execute(table.delete())
        db.session.commit()
    yield

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def admin_user(app):
    with app.app_context():
        user = User(
            name="Admin Tester",
            email="admin@stocksense.test",
            role="ADMIN",
            is_active=True,
        )
        user.set_password("AdminSecurePass123!")
        db.session.add(user)
        db.session.commit()
        return user.to_dict()

@pytest.fixture
def auth_headers(client, admin_user):
    """Authenticate and return Bearer token headers."""
    resp = client.post(
        "/api/auth/login",
        json={"email": "admin@stocksense.test", "password": "AdminSecurePass123!"},
    )
    token = resp.get_json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

@pytest.fixture
def seed_data(app):
    """Seed sample warehouse, locations, category, and products."""
    with app.app_context():
        # Warehouse
        wh1 = Warehouse(name="Central Hub", location="New York", capacity=10000.0)
        wh2 = Warehouse(name="West Coast Annex", location="San Francisco", capacity=5000.0)
        db.session.add_all([wh1, wh2])
        db.session.flush()

        # Locations
        loc1 = Location(warehouse_id=wh1.id, name="Rack 1", rack_number="A-01", capacity=2000.0)
        loc2 = Location(warehouse_id=wh1.id, name="Rack 2", rack_number="A-02", capacity=2000.0)
        loc3 = Location(warehouse_id=wh2.id, name="Bay 1", rack_number="B-01", capacity=2000.0)
        db.session.add_all([loc1, loc2, loc3])
        db.session.flush()

        # Category
        cat = Category(name="Electronics", description="Electronic components")
        db.session.add(cat)
        db.session.flush()

        # Products
        p1 = Product(
            name="Microcontroller board",
            sku="MCU-328P",
            category_id=cat.id,
            minimum_stock=15.0,
            maximum_stock=500.0,
            reorder_quantity=50.0,
            cost_price=12.50,
        )
        p2 = Product(
            name="OLED Display Module",
            sku="OLED-096",
            category_id=cat.id,
            minimum_stock=20.0,
            maximum_stock=300.0,
            reorder_quantity=40.0,
            cost_price=4.20,
        )
        db.session.add_all([p1, p2])
        db.session.commit()

        return {
            "warehouse_1_id": wh1.id,
            "warehouse_2_id": wh2.id,
            "location_1_id": loc1.id,
            "location_2_id": loc2.id,
            "location_3_id": loc3.id,
            "category_id": cat.id,
            "product_1_id": p1.id,
            "product_2_id": p2.id,
        }
