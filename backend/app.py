import os
import sys
from app import create_app
from app.extensions import db
import app.models

env_name = os.getenv("FLASK_ENV", "development")
app = create_app(env_name)

def initialize_database():
    with app.app_context():
        db.create_all()
        print("Database tables initialized successfully!")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "init-db":
        initialize_database()
        sys.exit(0)

    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("DEBUG", "True").lower() in ["true", "1", "t"]
    use_reloader = os.getenv("USE_RELOADER", "False").lower() in ["true", "1", "t"]
    print(f"Starting StockSense Backend on port {port} (debug={debug}, reloader={use_reloader})...")
    app.run(host="0.0.0.0", port=port, debug=debug, use_reloader=use_reloader)

