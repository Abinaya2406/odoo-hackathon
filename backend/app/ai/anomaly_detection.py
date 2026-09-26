from app.models.stock_ledger import StockLedger
from app.models.product import Product

class AnomalyDetector:
    """
    AI module for detecting unusual transaction sizes in stock movements.
    Combines Z-score statistical analysis and outlier boundary computation.
    """
    @staticmethod
    def detect_anomalies(limit_records: int = 500) -> list[dict]:
        import numpy as np
        import pandas as pd
        # Fetch recent ledger entries
        entries = (
            StockLedger.query.order_by(StockLedger.created_at.desc())
            .limit(limit_records)
            .all()
        )

        if not entries or len(entries) < 5:
            return []

        # Convert entries to Pandas DataFrame
        data = [
            {
                "id": e.id,
                "product_id": e.product_id,
                "transaction_type": e.transaction_type,
                "quantity": abs(float(e.quantity)),
                "reference_id": e.reference_id,
                "warehouse_id": e.warehouse_id,
                "created_at": e.created_at.isoformat() if e.created_at else None,
            }
            for e in entries
        ]
        df = pd.DataFrame(data)

        anomalies = []

        # Group by product to evaluate contextual transaction deviations
        for product_id, group in df.groupby("product_id"):
            if len(group) < 3:
                continue

            quantities = group["quantity"].values
            mean = float(np.mean(quantities))
            std = float(np.std(quantities))

            # If standard deviation is 0 (all quantities identical), skip or evaluate absolute magnitude
            if std == 0.0:
                continue

            product = Product.query.get(int(product_id))
            if not product:
                continue

            normal_min = max(0.0, round(mean - (2.0 * std), 2))
            normal_max = round(mean + (2.0 * std), 2)

            for _, row in group.iterrows():
                qty = row["quantity"]
                z_score = (qty - mean) / std

                if z_score >= 2.0:
                    # Determine severity
                    if z_score >= 3.5:
                        severity = "CRITICAL"
                    elif z_score >= 2.8:
                        severity = "HIGH"
                    else:
                        severity = "WARNING"

                    anomalies.append({
                        "product": {
                            "id": product.id,
                            "name": product.name,
                            "sku": product.sku,
                        },
                        "transaction": {
                            "id": int(row["id"]),
                            "type": row["transaction_type"],
                            "reference_id": row["reference_id"],
                        },
                        "normal_range": f"{normal_min} - {normal_max}",
                        "detected_quantity": qty,
                        "deviation_score": round(float(z_score), 2),
                        "severity": severity,
                        "date": row["created_at"],
                        "status": "FLAGGED",
                    })

        # Sort by deviation score descending
        anomalies.sort(key=lambda a: -a["deviation_score"])
        return anomalies
