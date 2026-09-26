import os
from datetime import datetime, timedelta
import random

from app import create_app
from app.extensions import db
from app.models import (
    User,
    Category,
    Supplier,
    Warehouse,
    Location,
    Product,
    Stock,
    StockLedger,
    Notification
)

app = create_app(os.getenv("FLASK_ENV", "development"))

def seed():
    with app.app_context():
        print("[START] Starting StockSense comprehensive database seeding...")

        # 1. Categories
        categories_data = [
            {"name": "Raw Materials / Construction", "description": "Metals, alloys, steel rods, and construction grade supplies"},
            {"name": "Electrical Components", "description": "Cables, wires, battery packs, and electronic hardware"},
            {"name": "Industrial Machinery", "description": "Bearings, motors, pneumatic pumps, and heavy equipment parts"},
            {"name": "Electronics & Sensors", "description": "IoT devices, thermal scanners, barcode terminals, and microcontrollers"},
            {"name": "Packaging & Shipping", "description": "Cartons, bubble wraps, strapping tape, and shipping materials"},
            {"name": "Office & Admin", "description": "Barcodes, thermal labels, RFID tags, and warehouse stationery"},
            {"name": "Safety & PPE", "description": "High-vis vests, protective helmets, gloves, and safety gear"},
        ]

        categories = {}
        for c in categories_data:
            cat = Category.query.filter_by(name=c["name"]).first()
            if not cat:
                cat = Category(name=c["name"], description=c["description"])
                db.session.add(cat)
                db.session.flush()
            categories[c["name"]] = cat
        print(f"[OK] Categories created/verified: {len(categories)}")

        # 2. Suppliers
        suppliers_data = [
            {"name": "Jindal Steel & Power Ltd.", "email": "orders@jindalsteel.example.com", "phone": "+91 80 4123 4567", "address": "Jindal Centre, 12 Bhikaiji Cama Place, New Delhi"},
            {"name": "Polycab Electricals", "email": "procurement@polycab.example.com", "phone": "+91 22 2845 9900", "address": "Polycab House, Mogra Village, Andheri East, Mumbai"},
            {"name": "Apex Precision Engineering", "email": "supply@apexeng.example.com", "phone": "+91 11 4987 6543", "address": "Okhla Industrial Area Phase III, New Delhi"},
            {"name": "SensTech Global", "email": "contact@senstech.example.com", "phone": "+91 80 6712 3400", "address": "International Tech Park, Whitefield, Bengaluru"},
            {"name": "EcoPack Industries", "email": "orders@ecopack.example.com", "phone": "+91 11 2678 1234", "address": "Sector 24 Industrial Estate, Faridabad, Haryana"},
            {"name": "PrintPro Supplies", "email": "support@printpro.example.com", "phone": "+91 80 5543 2198", "address": "Peenya 2nd Stage, Bengaluru"},
            {"name": "LogiTech Solutions", "email": "sales@logitechsol.example.com", "phone": "+91 80 3982 1000", "address": "EPIP Zone, Whitefield, Bengaluru"},
        ]

        suppliers = {}
        for s in suppliers_data:
            sup = Supplier.query.filter_by(name=s["name"]).first()
            if not sup:
                sup = Supplier(name=s["name"], email=s["email"], phone=s["phone"], address=s["address"])
                db.session.add(sup)
                db.session.flush()
            suppliers[s["name"]] = sup
        print(f"[OK] Suppliers created/verified: {len(suppliers)}")

        # 3. Warehouses & Locations
        warehouses_data = [
            {
                "name": "Main Warehouse (Bengaluru)",
                "location": "Electronic City Phase 1, Bengaluru, Karnataka",
                "capacity": 100000.0,
                "locations": [
                    {"name": "Bay A-01", "rack_number": "A-01", "capacity": 15000.0},
                    {"name": "Bay A-02", "rack_number": "A-02", "capacity": 15000.0},
                    {"name": "Shelf B-10", "rack_number": "B-10", "capacity": 5000.0},
                    {"name": "Shelf B-11", "rack_number": "B-11", "capacity": 5000.0},
                    {"name": "Rack C-04", "rack_number": "C-04", "capacity": 10000.0},
                ]
            },
            {
                "name": "West Regional Hub (Mumbai)",
                "location": "Bhiwandi Logistics Park, Mumbai, Maharashtra",
                "capacity": 85000.0,
                "locations": [
                    {"name": "Rack 04-A", "rack_number": "04-A", "capacity": 12000.0},
                    {"name": "Rack 04-B", "rack_number": "04-B", "capacity": 12000.0},
                    {"name": "Bay 4 Staging", "rack_number": "STG-04", "capacity": 20000.0},
                    {"name": "Zone M-1", "rack_number": "ZM-01", "capacity": 10000.0},
                ]
            },
            {
                "name": "North Fulfillment Depot (Delhi NCR)",
                "location": "Kundli Industrial Area, Sonipat, Delhi NCR",
                "capacity": 60000.0,
                "locations": [
                    {"name": "Section D-01", "rack_number": "D-01", "capacity": 8000.0},
                    {"name": "Bin N-08", "rack_number": "N-08", "capacity": 4000.0},
                    {"name": "Staging N-02", "rack_number": "STG-02", "capacity": 10000.0},
                ]
            }
        ]

        warehouses = {}
        locations = {}
        for w_info in warehouses_data:
            wh = Warehouse.query.filter_by(name=w_info["name"]).first()
            if not wh:
                wh = Warehouse(name=w_info["name"], location=w_info["location"], capacity=w_info["capacity"])
                db.session.add(wh)
                db.session.flush()
            warehouses[w_info["name"]] = wh

            for loc_info in w_info["locations"]:
                loc_key = f"{w_info['name']}::{loc_info['name']}"
                loc = Location.query.filter_by(warehouse_id=wh.id, name=loc_info["name"]).first()
                if not loc:
                    loc = Location(
                        warehouse_id=wh.id,
                        name=loc_info["name"],
                        rack_number=loc_info["rack_number"],
                        capacity=loc_info["capacity"]
                    )
                    db.session.add(loc)
                    db.session.flush()
                locations[loc_key] = loc
        print(f"[OK] Warehouses ({len(warehouses)}) and Locations ({len(locations)}) created/verified")

        # 4. Products
        products_data = [
            {
                "name": "Steel Rod 12mm TMT",
                "sku": "SR-001",
                "category": "Raw Materials / Construction",
                "supplier": "Jindal Steel & Power Ltd.",
                "unit": "kg",
                "min_stock": 60.0,
                "max_stock": 2000.0,
                "reorder_qty": 500.0,
                "cost_price": 75.0,
                "wh": "Main Warehouse (Bengaluru)",
                "loc": "Bay A-01",
                "stock_qty": 180.0,
            },
            {
                "name": "Industrial Copper Wire 2.5mm",
                "sku": "CW-002",
                "category": "Electrical Components",
                "supplier": "Polycab Electricals",
                "unit": "coils",
                "min_stock": 25.0,
                "max_stock": 500.0,
                "reorder_qty": 100.0,
                "cost_price": 1250.0,
                "wh": "West Regional Hub (Mumbai)",
                "loc": "Rack 04-A",
                "stock_qty": 45.0,
            },
            {
                "name": "Deep Groove Ball Bearings 6204",
                "sku": "SKU-MECH-4105",
                "category": "Industrial Machinery",
                "supplier": "Apex Precision Engineering",
                "unit": "Boxes (10 pcs)",
                "min_stock": 30.0,
                "max_stock": 400.0,
                "reorder_qty": 100.0,
                "cost_price": 890.0,
                "wh": "North Fulfillment Depot (Delhi NCR)",
                "loc": "Bin N-08",
                "stock_qty": 0.0,
            },
            {
                "name": "Smart IoT Temperature & Humidity Sensor",
                "sku": "SKU-COMP-2042",
                "category": "Electronics & Sensors",
                "supplier": "SensTech Global",
                "unit": "Units",
                "min_stock": 20.0,
                "max_stock": 300.0,
                "reorder_qty": 60.0,
                "cost_price": 1850.0,
                "wh": "Main Warehouse (Bengaluru)",
                "loc": "Shelf B-10",
                "stock_qty": 18.0,
            },
            {
                "name": "Biodegradable Bubble Wrap Rolls (50m)",
                "sku": "SKU-PACK-8819",
                "category": "Packaging & Shipping",
                "supplier": "EcoPack Industries",
                "unit": "Rolls",
                "min_stock": 15.0,
                "max_stock": 250.0,
                "reorder_qty": 50.0,
                "cost_price": 650.0,
                "wh": "North Fulfillment Depot (Delhi NCR)",
                "loc": "Section D-01",
                "stock_qty": 12.0,
            },
            {
                "name": "Thermal Transfer Label Rolls (4x6 Inches)",
                "sku": "SKU-OFFC-5012",
                "category": "Office & Admin",
                "supplier": "PrintPro Supplies",
                "unit": "Rolls",
                "min_stock": 50.0,
                "max_stock": 600.0,
                "reorder_qty": 100.0,
                "cost_price": 340.0,
                "wh": "Main Warehouse (Bengaluru)",
                "loc": "Shelf B-11",
                "stock_qty": 85.0,
            },
            {
                "name": "Wireless Industrial Barcode Scanner X-200",
                "sku": "SKU-ELEC-1001",
                "category": "Electronics & Sensors",
                "supplier": "LogiTech Solutions",
                "unit": "Units",
                "min_stock": 30.0,
                "max_stock": 400.0,
                "reorder_qty": 50.0,
                "cost_price": 4500.0,
                "wh": "Main Warehouse (Bengaluru)",
                "loc": "Rack C-04",
                "stock_qty": 142.0,
            },
            {
                "name": "Rechargeable LiFePO4 Battery Pack 12V",
                "sku": "SKU-ELEC-7102",
                "category": "Electrical Components",
                "supplier": "Polycab Electricals",
                "unit": "Units",
                "min_stock": 20.0,
                "max_stock": 200.0,
                "reorder_qty": 40.0,
                "cost_price": 12500.0,
                "wh": "Main Warehouse (Bengaluru)",
                "loc": "Shelf B-10",
                "stock_qty": 35.0,
            },
            {
                "name": "ANSI Class 2 High-Visibility Safety Vests",
                "sku": "SKU-SAFE-6088",
                "category": "Safety & PPE",
                "supplier": "Apex Precision Engineering",
                "unit": "Units",
                "min_stock": 40.0,
                "max_stock": 500.0,
                "reorder_qty": 150.0,
                "cost_price": 320.0,
                "wh": "West Regional Hub (Mumbai)",
                "loc": "Zone M-1",
                "stock_qty": 86.0,
            },
            {
                "name": "Heavy-Duty Corrugated Shipping Boxes",
                "sku": "SKU-PACK-3009",
                "category": "Packaging & Shipping",
                "supplier": "EcoPack Industries",
                "unit": "Packs (50 pcs)",
                "min_stock": 100.0,
                "max_stock": 1500.0,
                "reorder_qty": 500.0,
                "cost_price": 45.0,
                "wh": "West Regional Hub (Mumbai)",
                "loc": "Rack 04-B",
                "stock_qty": 220.0,
            },
        ]

        products = {}
        for p_info in products_data:
            prod = Product.query.filter_by(sku=p_info["sku"]).first()
            cat = categories[p_info["category"]]
            sup = suppliers[p_info["supplier"]]
            if not prod:
                prod = Product(
                    name=p_info["name"],
                    sku=p_info["sku"],
                    category_id=cat.id,
                    supplier_id=sup.id,
                    unit_of_measure=p_info["unit"],
                    minimum_stock=p_info["min_stock"],
                    maximum_stock=p_info["max_stock"],
                    reorder_quantity=p_info["reorder_qty"],
                    cost_price=p_info["cost_price"],
                )
                db.session.add(prod)
                db.session.flush()
            products[p_info["sku"]] = prod

            # Stock record
            wh = warehouses[p_info["wh"]]
            loc_key = f"{p_info['wh']}::{p_info['loc']}"
            loc = locations[loc_key]

            stk = Stock.query.filter_by(product_id=prod.id, location_id=loc.id).first()
            if not stk:
                stk = Stock(
                    product_id=prod.id,
                    warehouse_id=wh.id,
                    location_id=loc.id,
                    quantity=p_info["stock_qty"]
                )
                db.session.add(stk)
            else:
                stk.quantity = p_info["stock_qty"]
            db.session.flush()

        print(f"[OK] Products ({len(products)}) and Stock records seeded")

        # 5. Populate Historical Stock Ledger Transactions
        # Clean existing test ledger if any to create clean realistic time series
        StockLedger.query.delete()
        db.session.commit()

        user = User.query.first()
        user_id = user.id if user else None

        base_time = datetime.utcnow()
        ledger_entries = []

        # Helper to record a ledger row
        def add_entry(product_sku, wh_name, loc_name, txn_type, qty, ref_id, days_ago, hours_ago=0, prev=100.0, curr=100.0):
            prod = products[product_sku]
            wh = warehouses[wh_name]
            loc = locations[f"{wh_name}::{loc_name}"]
            entry_time = base_time - timedelta(days=days_ago, hours=hours_ago)
            ledger_entries.append(
                StockLedger(
                    product_id=prod.id,
                    warehouse_id=wh.id,
                    location_id=loc.id,
                    transaction_type=txn_type,
                    quantity=qty,
                    reference_id=ref_id,
                    previous_quantity=prev,
                    new_quantity=curr,
                    created_by=user_id,
                    created_at=entry_time
                )
            )

        # A. Steel Rod (SR-001): Normal daily issues between 10-40 kg, then ANOMALY of 150 kg today
        # Days 10 to 1
        sr_history = [
            (10, 25.0), (9, 32.0), (8, 20.0), (7, 28.0), (6, 35.0),
            (5, 18.0), (4, 30.0), (3, 22.0), (2, 38.0), (1, 26.0)
        ]
        curr_sr = 500.0
        for days_ago, issue_qty in sr_history:
            prev = curr_sr
            curr_sr -= issue_qty
            add_entry("SR-001", "Main Warehouse (Bengaluru)", "Bay A-01", "DELIVERY", issue_qty, f"DO-2026-{1000+days_ago}", days_ago, 2, prev, curr_sr)

        # Anomaly entry today: 150 kg issue!
        add_entry("SR-001", "Main Warehouse (Bengaluru)", "Bay A-01", "DELIVERY", 150.0, "DO-2026-042", 0, 1, curr_sr, 180.0)

        # B. Copper Wire (CW-002): Normal deliveries (10-15 coils) & normal receipts (20-40 coils), then ANOMALY receipt of 200 coils
        cw_history = [(14, 12.0), (12, 10.0), (10, 15.0), (8, 11.0), (6, 14.0), (4, 9.0), (2, 12.0)]
        for days_ago, qty in cw_history:
            add_entry("CW-002", "West Regional Hub (Mumbai)", "Rack 04-A", "DELIVERY", qty, f"DO-CW-{days_ago}", days_ago, 4, 150.0, 138.0)
        # Normal receipts
        add_entry("CW-002", "West Regional Hub (Mumbai)", "Rack 04-A", "RECEIPT", 30.0, "PO-CW-01", 16, 3, 100.0, 130.0)
        add_entry("CW-002", "West Regional Hub (Mumbai)", "Rack 04-A", "RECEIPT", 35.0, "PO-CW-02", 9, 3, 115.0, 150.0)
        # Anomaly receipt yesterday: 200 coils!
        add_entry("CW-002", "West Regional Hub (Mumbai)", "Rack 04-A", "RECEIPT", 200.0, "PO-2026-104", 1, 6, 45.0, 245.0)

        # C. LiFePO4 Battery Pack (SKU-ELEC-7102): normal daily usage 2-8 units, then ANOMALY sudden drop of 45 units outside dispatch hours
        for d in range(8, 2, -1):
            add_entry("SKU-ELEC-7102", "Main Warehouse (Bengaluru)", "Shelf B-10", "DELIVERY", float(random.choice([3, 4, 5, 2])), f"DO-BAT-{d}", d, 4, 80.0, 76.0)
        # Anomaly entry: unlinked decrement of 45 units
        add_entry("SKU-ELEC-7102", "Main Warehouse (Bengaluru)", "Shelf B-10", "ADJUSTMENT", -45.0, "UNLINKED-LEDGER-SHIFT", 2, 8, 80.0, 35.0)

        # D. Ball Bearings (SKU-MECH-4105): 4 consecutive adjustments in 48h
        add_entry("SKU-MECH-4105", "North Fulfillment Depot (Delhi NCR)", "Bin N-08", "ADJUSTMENT", -8.0, "ADJ-2026-018", 1, 10, 30.0, 22.0)
        add_entry("SKU-MECH-4105", "North Fulfillment Depot (Delhi NCR)", "Bin N-08", "ADJUSTMENT", 5.0, "ADJ-2026-018", 1, 8, 22.0, 27.0)
        add_entry("SKU-MECH-4105", "North Fulfillment Depot (Delhi NCR)", "Bin N-08", "ADJUSTMENT", -12.0, "ADJ-2026-018", 0, 6, 27.0, 15.0)
        add_entry("SKU-MECH-4105", "North Fulfillment Depot (Delhi NCR)", "Bin N-08", "ADJUSTMENT", -15.0, "ADJ-2026-018", 0, 2, 15.0, 0.0)

        # E. Shipping Boxes (SKU-PACK-3009): abnormal transfer of 300 packs
        for d in [18, 12, 6]:
            add_entry("SKU-PACK-3009", "West Regional Hub (Mumbai)", "Rack 04-B", "DELIVERY", float(random.randint(40, 70)), f"DO-BX-{d}", d, 5, 400.0, 350.0)
        add_entry("SKU-PACK-3009", "West Regional Hub (Mumbai)", "Rack 04-B", "TRANSFER_OUT", 300.0, "TRF-2026-012", 3, 4, 520.0, 220.0)

        # F. Thermal Label Rolls (SKU-OFFC-5012): unexpected early bird intake of 450 rolls
        for d in [20, 15, 10, 5]:
            add_entry("SKU-OFFC-5012", "Main Warehouse (Bengaluru)", "Shelf B-11", "DELIVERY", 8.0, f"DO-LBL-{d}", d, 2, 120.0, 112.0)
        add_entry("SKU-OFFC-5012", "Main Warehouse (Bengaluru)", "Shelf B-11", "RECEIPT", 450.0, "REC-2026-029", 4, 3, 45.0, 495.0)

        # G. Safety Vests (SKU-SAFE-6088): 14 rapid checkout kiosk loops
        for i in range(14):
            add_entry("SKU-SAFE-6088", "West Regional Hub (Mumbai)", "Zone M-1", "DELIVERY", 1.0, f"KIOSK-LOG-2609-{i+1}", 0, 7, 100.0 - i, 99.0 - i)

        # H. IoT Sensors (SKU-COMP-2042): steady burn rate of 3 units/day
        for d in range(12, 0, -2):
            add_entry("SKU-COMP-2042", "Main Warehouse (Bengaluru)", "Shelf B-10", "DELIVERY", 3.0, f"DO-IOT-{d}", d, 5, 36.0, 33.0)

        # I. Bubble Wrap (SKU-PACK-8819): 1.5 - 2 rolls per day
        for d in range(10, 0, -2):
            add_entry("SKU-PACK-8819", "North Fulfillment Depot (Delhi NCR)", "Section D-01", "DELIVERY", 2.0, f"DO-BW-{d}", d, 3, 22.0, 20.0)

        # J. Barcode Scanners (SKU-ELEC-1001): 3-5 units per week
        for d in [25, 18, 11, 4]:
            add_entry("SKU-ELEC-1001", "Main Warehouse (Bengaluru)", "Rack C-04", "DELIVERY", 4.0, f"DO-SCN-{d}", d, 4, 158.0, 154.0)

        db.session.bulk_save_objects(ledger_entries)
        db.session.commit()
        print(f"[OK] StockLedger seeded with {len(ledger_entries)} realistic movement transactions!")

        # 6. Notifications
        Notification.query.delete()
        notifs = [
            Notification(
                user_id=user_id,
                title="Critical Stockout Warning",
                message="Deep Groove Ball Bearings (SKU-MECH-4105) has 0 units remaining in North Depot. Expedited PO PO-2026-088 is due in 48 hours.",
                type="ALERT",
                is_read=False
            ),
            Notification(
                user_id=user_id,
                title="AI Anomaly Detected",
                message="Unusual stock issue of 150 kg Steel Rod 12mm TMT detected in Main Warehouse (275% above standard upper boundary).",
                type="ALERT",
                is_read=False
            ),
            Notification(
                user_id=user_id,
                title="Predicted Stockout in 4 Days",
                message="Industrial Copper Wire (CW-002) is depleting rapidly at 11 coils/day. Reorder needed.",
                type="WARNING",
                is_read=False
            ),
            Notification(
                user_id=user_id,
                title="System Inventory Synchronized",
                message="Real-time multi-warehouse telemetry updated across CDC Bengaluru, West Hub Mumbai, and North Depot Delhi.",
                type="INFO",
                is_read=True
            ),
        ]
        db.session.bulk_save_objects(notifs)
        db.session.commit()
        print(f"[OK] Notifications seeded with {len(notifs)} alerts")

        print("[DONE] StockSense Database Seeding Complete!")

if __name__ == "__main__":
    seed()
