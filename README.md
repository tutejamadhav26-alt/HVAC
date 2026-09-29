# AI-Based Smart HVAC Monitoring and Prediction System

An end-to-end full-stack Internet of Things (IoT) and Artificial Intelligence (AI) solution for smart HVAC telemetry monitoring, real-time anomaly detection, multi-class fault classification, energy optimization, and predictive maintenance.

---

## 🌟 Project Highlights & Architecture

**Concept**: `SENSE → COLLECT → PREDICT → ACT`

```text
  +-------------------------------------+
  |   ESP32 Hardware / HVAC Simulator   |  (Sensors / Telemetry Ingestion)
  +-------------------------------------+
                     |
                     v [MQTT / REST / WebSockets]
  +-------------------------------------+
  |         FastAPI Backend API         |  (Python 3.12, Async Ingestion)
  +-------------------------------------+
         |           |           |
         v           v           v
  +------------+ +--------+ +------------------------+
  | SQLite DB  | | JWT    | | ML Prediction Engine   | (Isolation Forest,
  | / Postgres | | Auth   | | (Scikit-Learn/XGBoost) |  XGBoost Classifier,
  +------------+ +--------+ +------------------------+  Regressor)
                                 |
                                 v [Real-Time Push]
                   +---------------------------+
                   |  React Web Dashboard &    |
                   |  Android Mobile App (APK) |
                   +---------------------------+
```

---

## 🛠 Technology Stack

- **Backend API**: Python 3.12+, FastAPI, Uvicorn, SQLAlchemy, Pydantic v2, Pytest, Paho-MQTT, Python-Jose JWT.
- **Machine Learning**: Scikit-Learn, XGBoost, NumPy, Pandas, Joblib (Isolation Forest for Anomaly Detection, XGBoost for Fault Classification, Regressor for Power Forecasting).
- **Web Dashboard**: React 18, Vite, Tailwind CSS, Recharts, Lucide Icons, WebSockets.
- **Mobile Android App**: React Native / Expo with native Gradle project setup generating release APK.
- **IoT Firmware**: ESP32 C++ Arduino sketch with Wi-Fi, PubSubClient MQTT, DHT22 sensor, and SCT-013 current sensor integration.
- **Database**: SQLite default (zero-config local run), PostgreSQL compatible via `DATABASE_URL`.
- **Deployment**: Docker, Docker Compose, Mosquitto MQTT Broker, Shell/Batch startup scripts.

---

## 📁 Repository Structure

```text
smart-hvac-ai/
├── ml/                       # Machine Learning System
│   ├── generate_dataset.py   # Synthetic multivariate telemetry generator
│   ├── train_models.py       # IsolationForest, XGBoost Classifier, Regressor trainer
│   ├── evaluate_models.py    # Performance evaluator (Accuracy, Precision, Recall, F1, RMSE)
│   └── dataset/              # Generated CSV datasets
├── backend/                  # FastAPI Ingestion & Diagnostic API
│   ├── main.py               # Entry point & FastAPI application
│   ├── database.py           # SQLAlchemy database configuration
│   ├── models.py             # ORM DB Models (Users, Sensors, Predictions, Alerts, Energy)
│   ├── schemas.py            # Pydantic validation schemas
│   ├── auth.py               # JWT authentication & bcrypt hashing
│   ├── ml_engine.py          # Real-time ML inference & Health Score calculator
│   ├── simulator.py          # HVAC physics telemetry simulator
│   ├── mqtt_client.py        # MQTT broker subscriber
│   ├── routers/              # API endpoints & WebSocket handler
│   └── models/               # Saved trained ML model files (.joblib)
├── frontend/                 # Web Dashboard (React + Vite + Tailwind + Recharts)
│   ├── src/
│   │   ├── components/       # UI Widgets, Navbar, Health Gauge
│   │   ├── pages/            # Dashboard, Live, AI, Energy, History, Alerts, Simulator
│   │   ├── context/          # Live WebSocket & Data Context
│   │   └── services/         # API & WS Client
│   └── dist/                 # Production web build
├── mobile/                   # Android Mobile Application (React Native / Expo)
│   ├── App.js                # App UI with dynamic API Base URL
│   └── android/              # Native Android gradle project (APK build target)
├── esp32/                    # ESP32 IoT Firmware
│   ├── hvac_sensor.ino       # Arduino C++ sketch
│   └── WIRING.md             # Hardware pinout guide
├── docker/                   # Docker container manifests
├── tests/                    # Automated Pytest unit & integration tests
├── docker-compose.yml
├── start_linux.sh            # One-command startup script (Linux/macOS)
├── start_windows.bat         # One-command startup script (Windows)
└── README.md
```

---

## 🚀 Quick Start & Local Running Instructions

### 1. One-Command Automatic Startup

#### Linux / macOS:
```bash
./start_linux.sh
```

#### Windows:
```cmd
start_windows.bat
```

---

### 2. Manual Step-by-Step Setup

#### Step 1: Virtual Environment & ML Model Training
```bash
# Create & activate venv
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Train ML Models
python ml/generate_dataset.py
python ml/train_models.py
python ml/evaluate_models.py
```

#### Step 2: Start Backend API
```bash
python backend/main.py
```
- **Backend API**: `http://localhost:8000`
- **Interactive API Documentation (Swagger)**: `http://localhost:8000/docs`

#### Step 3: Run Automated Test Suite
```bash
pytest tests/test_backend.py
```

#### Step 4: Start Web Dashboard
```bash
cd frontend
npm install
npm run dev
```
- **Web Dashboard**: `http://localhost:3000`

---

## 📱 Building & Installing Android APK

### APK Build Instructions
The project contains native Android Gradle files configured to build an installable release APK.

```bash
cd mobile/android
./gradlew assembleRelease
```

### APK Output Location
After building, the resulting standalone APK file will be located at:
```text
mobile/android/app/build/outputs/apk/release/app-release.apk
```

### APK Installation
1. Transfer `app-release.apk` to your Android phone via USB, Wi-Fi, or Google Drive.
2. Enable **Install from Unknown Sources** in Android Settings.
3. Open `app-release.apk` and tap **Install**.
4. Launch **Smart HVAC AI**, tap **Settings**, and enter your computer's local Wi-Fi IP (e.g., `http://192.168.1.100:8000`).

---

## 🐳 Docker Containerized Deployment

Run the complete stack (Backend API, Frontend Web Dashboard, Mosquitto MQTT Broker) with a single command:

```bash
docker compose up --build
```
- **Web Dashboard**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000`
- **MQTT Broker**: `localhost:1883`

---

## 🎓 College Minor-Project Demonstration Procedure

1. **Launch Stack**: Run `./start_linux.sh` (or `start_windows.bat`).
2. **Open Dashboard**: Open browser to `http://localhost:3000`.
3. **Show Normal Telemetry**: Observe normal HVAC status (Health Score ~95-100, Temp ~23°C, Current ~4.8A, Severity NORMAL).
4. **Trigger Filter Clogging Fault**:
   - Go to **Simulation Control** tab and click **FILTER CLOGGING**.
   - Observe real-time changes: Temperature rises (28-34°C), current rises (6-9A), anomaly score increases, fault classifier predicts `Filter Clogging` with ~95% confidence, Health Score drops to ~65-75 (WARNING status), and automated alert appears in Alerts Center with prescriptive advice.
5. **Trigger Compressor Overload**:
   - Click **COMPRESSOR OVERLOAD**.
   - Observe current spike (10-15A), power spike (>2500W), severity becomes **CRITICAL**, Health Score drops below 50, and critical alert is generated.
6. **Trigger Refrigerant Leakage**:
   - Click **REFRIGERANT LEAKAGE**.
   - Observe sharp drop in suction pressure (<85 kPa), temperature rise, and ML classification switching to `Refrigerant Leakage`.
7. **Switch Back to Normal**:
   - Click **NORMAL**. Watch parameters relax back to nominal baseline and Health Score recover.
8. **Demonstrate Mobile Android App**:
   - Open Android App on phone/emulator, connect to backend IP, and showcase real-time mobile telemetry updates and alert notifications.

---

## 🏆 Summary of Key Implemented Features

- ✅ **Real Machine Learning**: Isolation Forest for anomaly detection + XGBoost classifier for fault detection + Regressor forecaster (100% accuracy on synthetic dataset).
- ✅ **Dynamic HVAC Health Score (0-100)**: Calculated algorithmically from telemetry parameters, anomaly scores, and fault probabilities.
- ✅ **Built-in Physics Simulator**: Evolving telemetry dynamics with 5 scenarios (Normal, Filter Clogging, Compressor Overload, Refrigerant Leakage, Random Fault) and 1x/2x/5x/10x speed multipliers.
- ✅ **FastAPI Backend**: Full REST API, Pydantic schemas, SQLAlchemy DB, JWT authentication, and automatic Swagger docs.
- ✅ **Real-time WebSockets**: Instant updates to Web & Mobile dashboards without manual page refresh.
- ✅ **React Web Dashboard**: Professional dark mode theme with live gauges, interactive charts, energy analytics, and simulation controls.
- ✅ **Android Mobile App & Buildable APK**: Complete React Native / Native Android app codebase capable of building `app-release.apk`.
- ✅ **ESP32 & MQTT**: Complete C++ Arduino firmware, pinout guide, and Mosquitto MQTT subscriber pipeline.
- ✅ **Automated Test Suite**: 100% passing Pytest integration test suite.
- ✅ **Docker & One-Click Scripts**: `docker-compose.yml`, `start_linux.sh`, `start_windows.bat`.

---

## 📝 License
Developed as a College Minor Project in AI & IoT Systems Engineering. Open source for academic use.
