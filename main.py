import sys
import os

backend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
if os.path.exists(backend_path) and backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app.main import app

__all__ = ["app"]
