from flask import jsonify
import random
import string
from datetime import datetime

def api_response(success: bool, message: str, data=None, errors=None, status_code: int = 200):
    """
    Standardized API response structure:
    Success:
    {
        "success": true,
        "message": "...",
        "data": { ... }
    }
    Error:
    {
        "success": false,
        "message": "...",
        "errors": { ... }
    }
    """
    payload = {
        "success": success,
        "message": message,
    }
    if success:
        if data is not None:
            payload["data"] = data
    else:
        if errors is not None:
            payload["errors"] = errors
            
    return jsonify(payload), status_code

def generate_reference_number(prefix: str) -> str:
    """Generate unique human-readable reference number like REC-20260926-AB12."""
    date_str = datetime.utcnow().strftime("%Y%m%d")
    random_str = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"{prefix}-{date_str}-{random_str}"

def paginate(query, page: int = 1, limit: int = 20):
    """Paginate a SQLAlchemy query and return items and metadata."""
    if page < 1:
        page = 1
    if limit < 1 or limit > 100:
        limit = 20

    total = query.count()
    items = query.offset((page - 1) * limit).limit(limit).all()
    pages = (total + limit - 1) // limit if limit > 0 else 1

    return {
        "items": items,
        "pagination": {
            "total": total,
            "page": page,
            "limit": limit,
            "pages": pages,
            "has_next": page < pages,
            "has_prev": page > 1,
        }
    }
