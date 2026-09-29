#!/bin/bash
echo "============================================================"
echo "    Starting AI-Based Smart HVAC Monitoring System Stack"
echo "============================================================"

if [ ! -d "venv" ]; then
    echo "[+] Creating Python virtual environment..."
    python3 -m venv venv
    ./venv/bin/pip install -r backend/requirements.txt
fi

if [ ! -f "backend/models/fault_classifier.joblib" ]; then
    echo "[+] Training Machine Learning Models..."
    ./venv/bin/python3 ml/generate_dataset.py
    ./venv/bin/python3 ml/train_models.py
fi

echo "[+] Starting FastAPI Backend API on http://localhost:8000..."
./venv/bin/python3 backend/main.py &
BACKEND_PID=$!

echo "[+] Starting React Web Dashboard on http://localhost:3000..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "============================================================"
echo "All Services Started!"
echo "Backend API:      http://localhost:8000"
echo "API Docs:          http://localhost:8000/docs"
echo "Web Dashboard:     http://localhost:3000"
echo "============================================================"
echo "Press CTRL+C to stop all services."

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
