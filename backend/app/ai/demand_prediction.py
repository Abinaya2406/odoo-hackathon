from datetime import datetime, timedelta
from app.models.product import Product
from app.models.stock_ledger import StockLedger

class DemandPredictor:
    """
    Modular AI module for predicting product demand based on historical stock movement (deliveries/outflows).
    Uses scikit-learn LinearRegression and moving averages.
    """
    @staticmethod
    def forecast_product_demand(product_id: int, forecast_days: int = 30) -> dict:
        import numpy as np
        import pandas as pd
        from sklearn.linear_model import LinearRegression
        product = Product.query.get(product_id)
        if not product or product.is_deleted:
            raise ValueError("Product not found.")

        current_stock = product.total_stock

        # Fetch historical deliveries for this product
        ledger_records = (
            StockLedger.query.filter(
                StockLedger.product_id == product_id,
                StockLedger.transaction_type.in_(["DELIVERY", "TRANSFER_OUT"]),
            )
            .order_by(StockLedger.created_at.asc())
            .all()
        )

        # Baseline calculation if historical data is limited
        if len(ledger_records) < 3:
            # Baseline estimate using minimum_stock / reorder_quantity heuristic
            daily_baseline = max(product.minimum_stock / 15.0, product.reorder_quantity / 30.0, 1.0)
            predicted_demand = round(daily_baseline * forecast_days, 2)
            confidence_score = 0.55  # Heuristic baseline confidence

            return {
                "product": {
                    "id": product.id,
                    "name": product.name,
                    "sku": product.sku,
                    "unit_of_measure": product.unit_of_measure,
                },
                "current_stock": current_stock,
                "predicted_demand": predicted_demand,
                "forecast_period": f"Next {forecast_days} Days",
                "daily_average_demand": round(daily_baseline, 2),
                "confidence_score": confidence_score,
                "model_used": "Baseline Moving Heuristic",
            }

        # Data modeling with Pandas
        data = [
            {"date": r.created_at.date(), "quantity": abs(float(r.quantity))}
            for r in ledger_records
        ]
        df = pd.DataFrame(data)
        daily_df = df.groupby("date")["quantity"].sum().reset_index()

        # Build day-index feature for regression
        min_date = daily_df["date"].min()
        daily_df["day_index"] = (daily_df["date"] - min_date).apply(lambda d: d.days)

        X = daily_df[["day_index"]].values
        y = daily_df["quantity"].values

        try:
            model = LinearRegression()
            model.fit(X, y)
            r2 = max(0.0, model.score(X, y))

            # Forecast for the next N days
            last_day = daily_df["day_index"].max()
            future_indices = np.arange(last_day + 1, last_day + 1 + forecast_days).reshape(-1, 1)
            future_predictions = model.predict(future_indices)

            # Demands cannot be negative
            daily_predicted = np.maximum(future_predictions, 0.0)
            predicted_demand = round(float(np.sum(daily_predicted)), 2)

            # Confidence based on R2 and number of samples
            sample_boost = min(len(daily_df) / 30.0, 0.3)
            confidence_score = round(min(0.6 + (r2 * 0.2) + sample_boost, 0.95), 2)
            model_name = "Linear Trend Regression"

        except Exception:
            # Fallback to mean moving average
            avg_daily = float(daily_df["quantity"].mean())
            predicted_demand = round(avg_daily * forecast_days, 2)
            confidence_score = 0.65
            model_name = "Historical Average"

        return {
            "product": {
                "id": product.id,
                "name": product.name,
                "sku": product.sku,
                "unit_of_measure": product.unit_of_measure,
            },
            "current_stock": current_stock,
            "predicted_demand": predicted_demand,
            "forecast_period": f"Next {forecast_days} Days",
            "daily_average_demand": round(predicted_demand / forecast_days, 2),
            "confidence_score": confidence_score,
            "model_used": model_name,
        }
