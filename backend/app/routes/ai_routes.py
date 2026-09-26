from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from app.utils.validators import parse_int_or_default
from app.utils.helpers import api_response
from app.services.ai_intelligence_service import AIIntelligenceService

ai_bp = Blueprint("ai", __name__, url_prefix="/api/ai")

@ai_bp.route("/forecast/<int:product_id>", methods=["GET"])
@jwt_required(optional=True)
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
@jwt_required(optional=True)
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

@ai_bp.route("/stockout-predictions", methods=["GET"])
@jwt_required(optional=True)
def stockout_predictions():
    """
    Get live inventory stockout predictions and depletion trajectories computed from database.
    """
    risk_level = request.args.get("riskLevel") or request.args.get("risk_level")
    search = request.args.get("search")
    try:
        result = AIIntelligenceService.get_stockout_predictions(risk_level=risk_level, search=search)
        return api_response(
            success=True,
            message="Stockout predictions computed successfully",
            data={
                "items": result["items"],
                "kpis": result["kpis"]
            }
        )
    except Exception as e:
        return api_response(success=False, message=f"Stockout prediction failed: {str(e)}", status_code=500)

@ai_bp.route("/anomalies", methods=["GET"])
@jwt_required(optional=True)
def detect_anomalies():
    """
    Get statistical ledger anomalies with contextual details and time series.
    """
    filters = {
        "severity": request.args.get("severity"),
        "warehouse": request.args.get("warehouse"),
        "eventType": request.args.get("eventType"),
        "status": request.args.get("status"),
        "search": request.args.get("search")
    }
    try:
        result = AIIntelligenceService.get_anomalies(filters=filters)
        return api_response(
            success=True,
            message=f"Stock anomaly analysis completed ({len(result['items'])} anomalies flagged)",
            data={
                "items": result["items"],
                "kpis": result["kpis"]
            }
        )
    except Exception as e:
        return api_response(success=False, message=f"Anomaly detection failed: {str(e)}", status_code=500)

@ai_bp.route("/anomalies/<string:anomaly_id>/status", methods=["PATCH", "POST", "PUT"])
@jwt_required(optional=True)
def update_anomaly_status(anomaly_id: str):
    """
    Update review status of an anomaly record (Reviewed, Confirmed, Ignored).
    """
    json_data = request.get_json(silent=True) or {}
    new_status = json_data.get("status") or request.args.get("status") or "Reviewed"
    try:
        res = AIIntelligenceService.update_anomaly_status(anomaly_id, new_status)
        return api_response(success=True, message="Anomaly status updated successfully", data=res)
    except Exception as e:
        return api_response(success=False, message=f"Status update failed: {str(e)}", status_code=500)

@ai_bp.route("/assistant", methods=["GET", "POST"])
@jwt_required(optional=True)
def natural_language_assistant():
    """
    Natural Language AI Copilot endpoint querying live stock and anomaly data.
    """
    json_data = request.get_json(silent=True) or {}
    query = (json_data.get("query") or request.args.get("query") or request.form.get("query") or "").strip()
    if not query:
        return api_response(success=False, message="Query parameter is required", status_code=400)

    try:
        reply = AIIntelligenceService.process_assistant_query(query)
        return api_response(success=True, message="Assistant response generated", data=reply)
    except Exception as e:
        return api_response(success=False, message=f"Assistant processing failed: {str(e)}", status_code=500)
