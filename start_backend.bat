@echo off
echo Starting yatrasaathi FastAPI Backend on http://localhost:8000 ...
cd /d "%~dp0backend"
call .\venv\Scripts\activate.bat
python run_server.py
pause
