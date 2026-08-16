import uvicorn
import os
import sys

# Add current directory to python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.main import app

if __name__ == "__main__":
    print("Starting YatraSaathi backend server...")
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
