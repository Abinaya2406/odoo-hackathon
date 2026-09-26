from datetime import datetime

def validate_date(date_string: str) -> datetime | None:
    """Safely parse ISO or standard YYYY-MM-DD date strings."""
    if not date_string:
        return None
    for fmt in ("%Y-%m-%d", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S"):
        try:
            return datetime.strptime(date_string.strip(), fmt)
        except ValueError:
            pass
    return None

def parse_int_or_default(value, default=None):
    """Safely parse integer from string."""
    try:
        if value is None:
            return default
        return int(value)
    except (ValueError, TypeError):
        return default

def parse_float_or_default(value, default=0.0):
    """Safely parse float from string."""
    try:
        if value is None:
            return default
        return float(value)
    except (ValueError, TypeError):
        return default
