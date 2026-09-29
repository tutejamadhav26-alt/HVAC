@echo off
echo ============================================================
echo     Starting AI-Based Smart HVAC Monitoring System Stack
echo ============================================================

if not exist "venv" (
    echo [+] Creating Python virtual environment...
    python -m venv venv
    call venv\Scripts\activate.bat
    pip install -r backend\requirements.txt
)

if not exist "backend\models\fault_classifier.joblib" (
    echo [+] Training Machine Learning Models...
    call venv\Scripts\activate.bat
    python ml\generate_dataset.py
    python ml\train_models.py
)

echo [+] Starting FastAPI Backend API on http://localhost:8000...
start cmd /k "venv\Scripts\activate.bat && python backend\main.py"

echo [+] Starting React Web Dashboard on http://localhost:3000...
start cmd /k "cd frontend && npm run dev"

echo ============================================================
echo All Services Started!
echo Backend API:      http://localhost:8000
echo API Docs:          http://localhost:8000/docs
echo Web Dashboard:     http://localhost:3000
echo ============================================================
pause
