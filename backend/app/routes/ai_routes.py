from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from app.utils.validators import parse_int_or_default
from app.utils.helpers import api_response

ai_bp = Blueprint("ai", __name__, url_prefix="/api/ai")

@ai_bp.route("/forecast/<int:product_id>", methods=["GET"])
@jwt_required()
def forecast_demand(product_id: int):
    from app.ai.demand_prediction import DemandPredictor
    days = parse_int_or_default(request.args.get("days"), 30)
    try:
        forecast = DemandPredictor.forecast_product_demand(product_id, forecast_days=days)
        return api_response(success=True, message="Demand forecast generated successfully", data=forecast)
    except ValueError as e:
        return api_response(success=False, message=str(e), status_code=404)
    except Exception as e:
        return api_response(success=False, message=f"Demand forecasting failed: {str(e)}", status_code=500)

@ai_bp.route("/reorder", methods=["GET"])
@jwt_required()
def smart_reorder():
    from app.ai.smart_reorder import SmartReorderAdvisor
    category_id = parse_int_or_default(request.args.get("category_id"))
    try:
        recommendations = SmartReorderAdvisor.get_recommendations(category_id=category_id)
        return api_response(
            success=True,
            message="Smart reorder recommendations generated successfully",
            data=recommendations,
        )
    except Exception as e:
        return api_response(success=False, message=f"Reorder analysis failed: {str(e)}", status_code=500)

@ai_bp.route("/anomalies", methods=["GET"])
@jwt_required()
def detect_anomalies():
    from app.ai.anomaly_detection import AnomalyDetector
    limit = parse_int_or_default(request.args.get("limit"), 500)
    try:
        anomalies = AnomalyDetector.detect_anomalies(limit_records=limit)
        return api_response(
            success=True,
            message=f"Stock anomaly analysis completed ({len(anomalies)} anomalies flagged)",
            data=anomalies,
        )
    except Exception as e:
        return api_response(success=False, message=f"Anomaly detection failed: {str(e)}", status_code=500)
