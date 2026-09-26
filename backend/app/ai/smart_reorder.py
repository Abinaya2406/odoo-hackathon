from app.models.product import Product
from app.ai.demand_prediction import DemandPredictor

class SmartReorderAdvisor:
    """
    AI-driven Smart Reorder Recommendation engine.
    Calculates safety stock, predicted 30-day demand, and suggested purchase order quantities.
    """
    @staticmethod
    def get_recommendations(category_id: int | None = None) -> list[dict]:
        query = Product.query.filter_by(is_deleted=False)
        if category_id:
            query = query.filter_by(category_id=category_id)

        products = query.all()
        recommendations = []

        for product in products:
            current_stock = product.total_stock

            # Run demand prediction
            forecast = DemandPredictor.forecast_product_demand(product.id, forecast_days=30)
            predicted_demand = forecast["predicted_demand"]

            # Safety Stock: 50% of minimum stock or at least 5 units
            safety_stock = round(max(product.minimum_stock * 0.5, 5.0), 2)
            reorder_level = product.minimum_stock

            # Recommended Order Quantity formula:
            # (Predicted Demand + Safety Stock + Reorder Quantity) - Current Stock
            target_stock = predicted_demand + safety_stock + product.reorder_quantity
            needed = target_stock - current_stock

            if needed > 0:
                recommended_qty = round(max(needed, product.reorder_quantity), 2)
            else:
                recommended_qty = 0.0

            # Urgency level classification
            if current_stock <= 0:
                urgency = "CRITICAL"
            elif current_stock <= product.minimum_stock:
                urgency = "HIGH"
            elif current_stock <= (product.minimum_stock + safety_stock):
                urgency = "MEDIUM"
            else:
                urgency = "LOW"

            recommendations.append({
                "product_id": product.id,
                "product_name": product.name,
                "sku": product.sku,
                "category_id": product.category_id,
                "category_name": product.category.name if product.category else None,
                "unit_of_measure": product.unit_of_measure,
                "current_stock": current_stock,
                "predicted_demand_30d": predicted_demand,
                "safety_stock": safety_stock,
                "reorder_level": reorder_level,
                "recommended_order_quantity": recommended_qty,
                "urgency": urgency,
                "unit_cost": product.cost_price,
                "estimated_reorder_cost": round(recommended_qty * product.cost_price, 2),
            })

        # Sort recommendations by urgency: CRITICAL > HIGH > MEDIUM > LOW
        urgency_priority = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
        recommendations.sort(key=lambda r: (urgency_priority.get(r["urgency"], 4), -r["recommended_order_quantity"]))

        return recommendations
