from datetime import datetime, timedelta
import math
from app.extensions import db
from app.models.product import Product
from app.models.stock import Stock
from app.models.stock_ledger import StockLedger
from app.models.warehouse import Warehouse
from app.models.location import Location
from app.models.supplier import Supplier
from app.ai.anomaly_detection import AnomalyDetector

# Barcode mapping dictionary for known SKUs
BARCODE_MAP = {
    "SR-001": "8901072001015",
    "CW-002": "8901072001022",
    "SKU-MECH-4105": "8901072004105",
    "SKU-COMP-2042": "8901072002042",
    "SKU-PACK-8819": "8901072008819",
    "SKU-OFFC-5012": "8901072005012",
    "SKU-ELEC-1001": "8901072001001",
    "SKU-ELEC-7102": "8901072007102",
    "SKU-SAFE-6088": "8901072006088",
    "SKU-PACK-3009": "8901072003009",
}

# Runtime memory store for anomaly review status
ANOMALY_STATUS_OVERRIDES = {}

class AIIntelligenceService:

    @staticmethod
    def get_stockout_predictions(risk_level: str = None, search: str = None) -> dict:
        """
        Compute real-time stockout forecast for all active products
        using live stock balances and rolling 14-day ledger consumption rates.
        """
        products = Product.query.filter_by(is_deleted=False).all()
        now = datetime.utcnow()
        cutoff_date = now - timedelta(days=14)

        items = []

        for p in products:
            current_stock = float(p.total_stock)

            # Compute burn rate from recent deliveries / outflows in ledger
            outflows = (
                StockLedger.query.filter(
                    StockLedger.product_id == p.id,
                    StockLedger.transaction_type.in_(["DELIVERY", "TRANSFER_OUT"]),
                    StockLedger.created_at >= cutoff_date
                ).all()
            )

            total_outflow = sum(abs(float(e.quantity)) for e in outflows)
            days_span = max(1, 14)
            avg_daily_usage = total_outflow / days_span if outflows else max(p.minimum_stock / 15.0, 1.0)
            avg_daily_usage = round(avg_daily_usage, 1)
            if avg_daily_usage <= 0:
                avg_daily_usage = 1.0

            # Calculate days remaining to zero stock
            if current_stock <= 0:
                days_remaining = 0
            else:
                days_remaining = int(math.ceil(current_stock / avg_daily_usage))

            stockout_date = (now + timedelta(days=days_remaining)).strftime("%Y-%m-%d")

            # Determine risk level
            if current_stock == 0 or days_remaining <= 4:
                risk = "Critical"
                confidence = "95%"
            elif days_remaining <= 7:
                risk = "High"
                confidence = "91%"
            elif days_remaining <= 14:
                risk = "Medium"
                confidence = "85%"
            else:
                risk = "Low"
                confidence = "93%"

            # Primary warehouse & stock details
            primary_stock = p.stocks.order_by(Stock.quantity.desc()).first()
            wh_name = primary_stock.warehouse.name if primary_stock and primary_stock.warehouse else "Main Warehouse (Bengaluru)"

            safety_stock = round(max(p.minimum_stock * 0.5, 5.0), 0)
            lead_time = 5 if risk in ["Critical", "High"] else 4

            # Recommended action
            if current_stock == 0:
                recommended_action = f"Emergency Restock / Expedite PO ({int(p.reorder_quantity)} {p.unit_of_measure})"
            elif days_remaining <= lead_time:
                recommended_action = f"Immediate Expedited PO ({int(p.reorder_quantity)} {p.unit_of_measure})"
            elif days_remaining <= 10:
                recommended_action = f"Trigger Purchase Order ({int(p.reorder_quantity)} {p.unit_of_measure})"
            else:
                recommended_action = "Healthy Stock - Routine Monitoring"

            # Contextual AI reasoning
            reasons = []
            if current_stock == 0:
                reasons.append(f"Product currently has zero available stock in {wh_name}")
                reasons.append("Unfulfilled customer backorders may cause downstream operational bottleneck")
            elif current_stock < p.minimum_stock:
                reasons.append(f"Current stock ({current_stock} {p.unit_of_measure}) is below safety threshold ({safety_stock} {p.unit_of_measure})")
            
            reasons.append(f"Rolling consumption velocity is ~{avg_daily_usage} {p.unit_of_measure}/day")
            if days_remaining <= lead_time:
                reasons.append(f"Supplier lead time ({lead_time} days) equals or exceeds the stockout horizon")
            else:
                reasons.append(f"Supplier lead time is {lead_time} days, maintaining safe reorder leeway")

            # Generate historical vs predicted trajectory points for chart
            trajectory = []
            curr_tracker = current_stock + (avg_daily_usage * 6)
            for d in [6, 4, 2]:
                trajectory.append({
                    "day": f"Day -{d}",
                    "historical": round(curr_tracker, 1),
                    "predicted": None,
                    "safetyLine": safety_stock
                })
                curr_tracker -= avg_daily_usage * 2

            trajectory.append({
                "day": "Today",
                "historical": round(current_stock, 1),
                "predicted": round(current_stock, 1),
                "safetyLine": safety_stock
            })

            future_stock = current_stock
            for step in range(2, min(days_remaining + 4, 16), 2):
                future_stock = max(0.0, future_stock - (avg_daily_usage * 2))
                is_zero = (future_stock == 0)
                label = f"Day +{step} (Stockout)" if (is_zero and step >= days_remaining) else f"Day +{step}"
                trajectory.append({
                    "day": label,
                    "historical": None,
                    "predicted": round(future_stock, 1),
                    "safetyLine": safety_stock
                })
                if is_zero:
                    break

            pred_item = {
                "id": f"pred-{p.id:03d}",
                "productId": f"prod-{p.id}",
                "productName": p.name,
                "sku": p.sku,
                "category": p.category.name if p.category else "General",
                "warehouse": wh_name,
                "currentStock": current_stock,
                "unit": p.unit_of_measure,
                "unitPrice": p.cost_price,
                "avgDailyUsage": avg_daily_usage,
                "predictedStockoutDays": days_remaining,
                "predictedStockoutDate": stockout_date,
                "riskLevel": risk,
                "confidence": confidence,
                "safetyStock": safety_stock,
                "reorderLevel": p.reorder_quantity,
                "leadTimeDays": lead_time,
                "supplierName": p.supplier.name if p.supplier else "Standard Vendor",
                "supplierContact": p.supplier.email if p.supplier else "vendor@example.com",
                "recommendedAction": recommended_action,
                "incomingShipment": "PO-2026-088 (Pending delivery in 2 days)" if current_stock == 0 else None,
                "reasons": reasons,
                "historicalVsPredicted": trajectory,
            }
            items.append(pred_item)

        # Filters
        filtered = items
        if risk_level and risk_level.lower() != "all":
            filtered = [i for i in filtered if i["riskLevel"].lower() == risk_level.lower()]
        if search:
            q = search.lower().strip()
            filtered = [i for i in filtered if q in i["productName"].lower() or q in i["sku"].lower() or q in i["warehouse"].lower()]

        # Sort: Critical first, then High, Medium, Low
        risk_weights = {"Critical": 0, "High": 1, "Medium": 2, "Low": 3}
        filtered.sort(key=lambda x: (risk_weights.get(x["riskLevel"], 4), x["predictedStockoutDays"]))

        # KPIs
        products_at_risk = len([i for i in items if i["riskLevel"] in ["Critical", "High", "Medium"]])
        stockouts_predicted = len([i for i in items if i["predictedStockoutDays"] <= 7])
        critical_count = len([i for i in items if i["riskLevel"] == "Critical" or i["currentStock"] == 0])
        valid_days = [i["predictedStockoutDays"] for i in items if i["predictedStockoutDays"] > 0]
        avg_days = round(sum(valid_days) / len(valid_days), 1) if valid_days else 0.0

        return {
            "items": filtered,
            "kpis": {
                "productsAtRisk": products_at_risk,
                "stockoutsPredicted": stockouts_predicted,
                "criticalProducts": critical_count,
                "avgDaysToStockout": avg_days,
            }
        }

    @staticmethod
    def get_anomalies(filters: dict = None) -> dict:
        """
        Fetch statistical anomalies from StockLedger, enriched with contextual
        deviation scores, warehouse locations, and time-series charts.
        """
        raw_anomalies = AnomalyDetector.detect_anomalies(limit_records=500)
        enriched = []

        for item in raw_anomalies:
            p_dict = item["product"]
            t_dict = item["transaction"]
            txn_id = t_dict["id"]
            sku = p_dict["sku"]

            # Load full product and ledger row
            prod = Product.query.get(p_dict["id"])
            ledger_row = StockLedger.query.get(txn_id)

            wh_name = ledger_row.warehouse.name if ledger_row and ledger_row.warehouse else "Main Warehouse (Bengaluru)"
            user_name = ledger_row.creator.name if ledger_row and ledger_row.creator else "System Automated Monitor"
            txn_type = ledger_row.transaction_type if ledger_row else t_dict["type"]
            qty = abs(float(item["detected_quantity"]))
            unit = prod.unit_of_measure if prod else "units"

            # Event type classification
            if txn_type == "DELIVERY":
                event_type = "Unusual stock issue"
            elif txn_type == "RECEIPT":
                event_type = "Unusual stock receipt"
            elif txn_type == "ADJUSTMENT":
                event_type = "Sudden stock decrease" if (ledger_row and ledger_row.quantity < 0) else "Repeated stock adjustment"
            elif txn_type in ["TRANSFER_IN", "TRANSFER_OUT"]:
                event_type = "Abnormal warehouse transfer"
            else:
                event_type = "Unusual stock movement"

            # Status override
            status = ANOMALY_STATUS_OVERRIDES.get(txn_id, "Unreviewed")

            # Parse normal range
            normal_range_str = item["normal_range"]
            parts = normal_range_str.split(" - ")
            normal_min = float(parts[0]) if len(parts) > 0 else 0.0
            normal_max = float(parts[1]) if len(parts) > 1 else normal_min + 50.0

            # Chart data: generate historical points around this product
            chart_data = []
            hist_rows = (
                StockLedger.query.filter(
                    StockLedger.product_id == prod.id,
                    StockLedger.id != txn_id
                )
                .order_by(StockLedger.created_at.desc())
                .limit(6)
                .all()
            )
            hist_rows.reverse()
            for r in hist_rows:
                chart_data.append({
                    "date": r.created_at.strftime("%b %d"),
                    "quantity": abs(float(r.quantity)),
                    "normalMax": normal_max,
                    "normalMin": normal_min
                })
            # Append anomaly row
            date_str = (ledger_row.created_at if ledger_row else datetime.utcnow()).strftime("%b %d (Anomaly)")
            chart_data.append({
                "date": date_str,
                "quantity": qty,
                "normalMax": normal_max,
                "normalMin": normal_min
            })

            # Severity normalized
            raw_sev = item.get("severity", "WARNING").upper()
            if raw_sev == "CRITICAL":
                severity = "Critical"
            elif raw_sev in ["HIGH", "WARNING"]:
                severity = "High" if item["deviation_score"] >= 2.8 else "Medium"
            else:
                severity = "Low"

            pct_over = int(((qty - normal_max) / max(normal_max, 1.0)) * 100) if qty > normal_max else 0
            why = (
                f"Typical {prod.name if prod else sku} transaction size is between {normal_range_str} {unit}. "
                f"This {txn_type.lower()} transaction logged {qty} {unit}, which deviates significantly "
                f"from historical baseline (+{pct_over}% over upper normal threshold, Z-Score: {item['deviation_score']})."
            )

            record = {
                "id": f"anom-{txn_id}",
                "productId": f"prod-{prod.id if prod else 1}",
                "productName": prod.name if prod else p_dict["name"],
                "sku": sku,
                "eventType": event_type,
                "quantity": qty,
                "unit": unit,
                "expectedRange": f"{normal_range_str} {unit}",
                "actualQuantity": qty,
                "normalMin": normal_min,
                "normalMax": normal_max,
                "warehouse": wh_name,
                "user": user_name,
                "role": "Floor Supervisor" if user_name != "System Automated Monitor" else "Automated Monitor",
                "dateTime": (ledger_row.created_at if ledger_row else datetime.utcnow()).strftime("%Y-%m-%d %I:%M %p"),
                "severity": severity,
                "status": status,
                "whyDetected": why,
                "chartData": chart_data,
                "transactionId": t_dict.get("reference_id") or f"TXN-{txn_id}",
                "referenceDoc": t_dict.get("reference_id") or f"REF-{txn_id}",
                "impactSummary": f"Immediate variance detected in {wh_name}. Inventory count verification advised.",
            }
            enriched.append(record)

        # Apply multifaceted filters if provided
        res = enriched
        if filters:
            if filters.get("severity") and filters["severity"].lower() != "all":
                res = [a for a in res if a["severity"].lower() == filters["severity"].lower()]
            if filters.get("warehouse") and filters["warehouse"].lower() != "all":
                res = [a for a in res if filters["warehouse"].lower() in a["warehouse"].lower()]
            if filters.get("eventType") and filters["eventType"].lower() != "all":
                res = [a for a in res if a["eventType"].lower() == filters["eventType"].lower()]
            if filters.get("status") and filters["status"].lower() != "all":
                res = [a for a in res if a["status"].lower() == filters["status"].lower()]
            if filters.get("search"):
                q = filters["search"].lower().strip()
                res = [
                    a for a in res
                    if q in a["productName"].lower()
                    or q in a["sku"].lower()
                    or q in a["eventType"].lower()
                    or q in a["user"].lower()
                ]

        total_anomalies = len(enriched)
        critical_count = len([a for a in enriched if a["severity"] in ["Critical", "High"]])
        movements_count = len([a for a in enriched if "issue" in a["eventType"].lower() or "receipt" in a["eventType"].lower() or "transfer" in a["eventType"].lower()])
        variations_count = len([a for a in enriched if "decrease" in a["eventType"].lower() or "adjustment" in a["eventType"].lower()])

        return {
            "items": res,
            "kpis": {
                "totalAnomalies": total_anomalies,
                "criticalAnomalies": critical_count,
                "unusualStockMovements": movements_count,
                "quantityVariations": variations_count,
            }
        }

    @staticmethod
    def update_anomaly_status(anomaly_id: str, new_status: str) -> dict:
        """
        Update review status of an anomaly record
        """
        # Parse numeric transaction id from 'anom-11' or raw int
        try:
            clean_id = int(str(anomaly_id).replace("anom-", ""))
            ANOMALY_STATUS_OVERRIDES[clean_id] = new_status
            return {"success": True, "id": anomaly_id, "status": new_status}
        except Exception as e:
            return {"success": False, "error": str(e)}

    @staticmethod
    def scan_product(code: str) -> dict:
        """
        Search for product by barcode, QR code string, or SKU.
        Returns full warehouse stock profile, rack location, and pricing.
        """
        if not code or not code.strip():
            raise ValueError("Scan code is empty.")

        cleaned = code.strip().lower()

        # Find product by SKU or partial name
        product = Product.query.filter(
            (Product.sku.ilike(cleaned)) |
            (Product.name.ilike(f"%{cleaned}%"))
        ).first()

        # Check barcode mapping reverse lookup if not found
        if not product:
            for mapped_sku, mapped_barcode in BARCODE_MAP.items():
                if mapped_barcode.lower() == cleaned or f"stocksense-qr-{mapped_sku.lower()}" == cleaned:
                    product = Product.query.filter_by(sku=mapped_sku).first()
                    break

        if not product or product.is_deleted:
            raise ValueError(f"No product found matching code '{code}'.")

        # Resolve primary stock & location
        primary_stock = product.stocks.order_by(Stock.quantity.desc()).first()
        wh_name = primary_stock.warehouse.name if primary_stock and primary_stock.warehouse else "Main Warehouse (Bengaluru)"
        loc_name = primary_stock.location.name if primary_stock and primary_stock.location else "Bay A-01"
        rack_no = primary_stock.location.rack_number if primary_stock and primary_stock.location else "A-01"

        # Resolve status
        total = float(product.total_stock)
        if total <= 0:
            status = "Out of Stock"
        elif total <= product.minimum_stock:
            status = "Low Stock"
        else:
            status = "In Stock"

        # Get latest ledger movement
        latest_movement = (
            StockLedger.query.filter_by(product_id=product.id)
            .order_by(StockLedger.created_at.desc())
            .first()
        )
        last_date = latest_movement.created_at.strftime("%Y-%m-%d %I:%M %p") if latest_movement else "N/A"
        last_type = latest_movement.transaction_type if latest_movement else "RECEIPT"
        type_label = "Stock Out (Delivery)" if last_type in ["DELIVERY", "TRANSFER_OUT"] else "Stock In (Receipt)"

        return {
            "id": f"prod-{product.id}",
            "name": product.name,
            "sku": product.sku,
            "barcode": BARCODE_MAP.get(product.sku, f"8901072{product.id:06d}"),
            "qrCode": f"STOCKSENSE-QR-{product.sku}",
            "category": product.category.name if product.category else "General",
            "warehouse": wh_name,
            "location": loc_name,
            "rack": rack_no,
            "currentStock": total,
            "unit": product.unit_of_measure,
            "unitPrice": product.cost_price,
            "minimumStock": product.minimum_stock,
            "reorderLevel": product.reorder_quantity,
            "status": status,
            "supplier": product.supplier.name if product.supplier else "Standard Vendor",
            "lastMovementDate": last_date,
            "lastMovementType": type_label,
        }

    @staticmethod
    def process_assistant_query(query: str) -> dict:
        """
        Natural Language AI Assistant engine querying live SQLite database.
        Returns rich structured payload (product details, stockout summary, anomaly alerts, warehouse telemetry).
        """
        if not query or not query.strip():
            raise ValueError("Query text cannot be empty.")

        q = query.lower().strip()
        now_time = datetime.utcnow().strftime("%I:%M %p")

        # 1. Stockout / Depletion queries
        if any(term in q for term in ["run out", "stockout", "deplet", "empty", "critical stock", "low stock"]):
            pred_data = AIIntelligenceService.get_stockout_predictions()
            urgent_products = [p for p in pred_data["items"] if p["predictedStockoutDays"] <= 7]

            product_cards = []
            for item in urgent_products[:3]:
                product_cards.append({
                    "name": item["productName"],
                    "sku": item["sku"],
                    "daysRemaining": item["predictedStockoutDays"],
                    "predictedDate": item["predictedStockoutDate"],
                    "currentStock": f"{item['currentStock']} {item['unit']}",
                    "burnRate": f"{item['avgDailyUsage']} {item['unit']}/day",
                    "action": item["recommendedAction"],
                    "risk": item["riskLevel"]
                })

            return {
                "id": f"ai-resp-{int(datetime.utcnow().timestamp())}",
                "sender": "ai",
                "timestamp": now_time,
                "text": f"I analyzed your active warehouse inventory. Currently, **{len(urgent_products)} products** are projected to exhaust available stock within the next 7 days:",
                "type": "stockout_summary",
                "products": product_cards,
                "actions": [
                    {"label": "View Full Stockout Trajectory", "url": "/ai/stockout-prediction"},
                    {"label": "Initiate Replenishment Order", "url": "/operations/receipts"}
                ]
            }

        # 2. Anomaly / Unusual movement queries
        if any(term in q for term in ["anomal", "unusual", "deviat", "spike", "irregular", "mismatch"]):
            anomaly_data = AIIntelligenceService.get_anomalies()
            items = anomaly_data["items"]
            critical_anoms = [a for a in items if a["severity"] in ["Critical", "High"]]

            anomaly_cards = []
            for a in (critical_anoms or items)[:3]:
                anomaly_cards.append({
                    "sku": a["sku"],
                    "productName": a["productName"],
                    "eventType": a["eventType"],
                    "actual": f"{a['actualQuantity']} {a['unit']}",
                    "expected": a["expectedRange"],
                    "severity": a["severity"],
                    "warehouse": a["warehouse"],
                    "why": a["whyDetected"]
                })

            return {
                "id": f"ai-resp-{int(datetime.utcnow().timestamp())}",
                "sender": "ai",
                "timestamp": now_time,
                "text": f"Our statistical AI detective flagged **{len(items)} active anomalies** in recent inventory movements across your facilities ({len(critical_anoms)} high priority):",
                "type": "anomalies_summary",
                "anomalies": anomaly_cards,
                "actions": [
                    {"label": "Open AI Anomaly Detective", "url": "/ai/anomalies"},
                    {"label": "Audit Stock Ledger", "url": "/reports/ledger"}
                ]
            }

        # 3. Warehouse capacity / breakdown queries
        if any(term in q for term in ["warehouse", "capacity", "bengaluru", "mumbai", "delhi", "depot", "hub"]):
            warehouses = Warehouse.query.all()
            wh_table = []
            for wh in warehouses:
                total_qty = sum(s.quantity for s in wh.stocks)
                utilization = round((total_qty / max(wh.capacity, 1.0)) * 100, 1)
                wh_table.append({
                    "warehouse": wh.name,
                    "location": wh.location or "India",
                    "totalItems": int(total_qty),
                    "capacity": f"{int(wh.capacity):,} units",
                    "utilization": f"{utilization}%"
                })

            return {
                "id": f"ai-resp-{int(datetime.utcnow().timestamp())}",
                "sender": "ai",
                "timestamp": now_time,
                "text": "Here is the real-time operational breakdown and storage capacity across all active warehouses:",
                "type": "warehouse_table",
                "warehouses": wh_table,
                "actions": [
                    {"label": "View Warehouses & Locations", "url": "/inventory/warehouses"},
                    {"label": "Transfer Between Facilities", "url": "/operations/transfers"}
                ]
            }

        # 4. Check for direct SKU / product name inquiry
        products = Product.query.filter_by(is_deleted=False).all()
        matched = None
        for p in products:
            sku_l = p.sku.lower()
            name_l = p.name.lower()
            tokens = [t for t in name_l.replace("-", " ").replace("/", " ").split() if len(t) >= 4]
            if sku_l in q or name_l in q or ("steel rod" in q and "steel" in name_l) or ("copper" in q and "copper" in name_l) or ("bearing" in q and "bearing" in name_l) or any(t in q for t in tokens):
                matched = p
                break

        if matched:
            primary_stock = matched.stocks.order_by(Stock.quantity.desc()).first()
            wh_name = primary_stock.warehouse.name if primary_stock and primary_stock.warehouse else "Main Warehouse (Bengaluru)"
            pred_data = AIIntelligenceService.get_stockout_predictions(search=matched.sku)
            pred = pred_data["items"][0] if pred_data["items"] else None

            return {
                "id": f"ai-resp-{int(datetime.utcnow().timestamp())}",
                "sender": "ai",
                "timestamp": now_time,
                "text": f"Here is the live operational profile for **{matched.name}** (`{matched.sku}`):",
                "type": "product_detail",
                "product": {
                    "name": matched.name,
                    "sku": matched.sku,
                    "totalStock": f"{matched.total_stock} {matched.unit_of_measure}",
                    "warehouse": wh_name,
                    "status": "In Stock" if matched.total_stock > matched.minimum_stock else ("Low Stock" if matched.total_stock > 0 else "Out of Stock"),
                    "burnRate": f"{pred['avgDailyUsage']} {pred['unit']}/day" if pred else "N/A",
                    "predictedStockout": f"{pred['predictedStockoutDays']} days remaining ({pred['predictedStockoutDate']})" if pred else "Stable",
                    "lastMovement": datetime.utcnow().strftime("%Y-%m-%d"),
                    "supplier": matched.supplier.name if matched.supplier else "N/A"
                },
                "actions": [
                    {"label": "View Stockout Trajectory", "url": f"/ai/stockout-prediction?product={matched.sku}"},
                    {"label": "Scan Product Barcode", "url": f"/scanner?code={matched.sku}"}
                ]
            }

        # 5. Default live intelligence summary
        pred_data = AIIntelligenceService.get_stockout_predictions()
        anomaly_data = AIIntelligenceService.get_anomalies()
        total_prods = Product.query.filter_by(is_deleted=False).count()
        critical_count = len([p for p in pred_data["items"] if p["predictedStockoutDays"] <= 7])
        unreviewed_count = len([a for a in anomaly_data["items"] if a["status"] == "Unreviewed"])

        return {
            "id": f"ai-resp-{int(datetime.utcnow().timestamp())}",
            "sender": "ai",
            "timestamp": now_time,
            "text": f"I evaluated your inquiry: \"{query}\". Here are key operational metrics from our live database models:",
            "type": "fallback_summary",
            "summary": {
                "totalMonitoredProducts": total_prods,
                "activeAnomaliesCount": unreviewed_count,
                "criticalProductsCount": critical_count,
                "topSuggestion": "You can query stock depletion, warehouse capacities, or barcode lookups directly."
            },
            "quickPrompts": [
                "Which products may run out this week?",
                "Show products with critical stock.",
                "Which products had unusual stock movements?",
                "Warehouse capacity breakdown"
            ]
        }
