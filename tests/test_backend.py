import sys
import os
import pytest
from fastapi.testclient import TestClient

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

from database import init_db
from main import app, seed_initial_data
from ml_engine import ml_engine
from simulator import simulator

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    init_db()
    seed_initial_data()
    # Trigger one simulation step to populate initial sensor readings
    simulator._process_step()

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_system_status():
    response = client.get("/api/system/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "OPERATIONAL"
    assert data["db_connected"] is True

def test_hvac_units():
    response = client.get("/api/hvac")
    assert response.status_code == 200
    units = response.json()
    assert len(units) > 0
    assert units[0]["unit_id"] == "HVAC-001"

def test_ml_inference():
    # Test Normal reading
    res_normal = ml_engine.predict(23.0, 50.0, 101.3, 4.8, 1050.0)
    assert "predicted_fault" in res_normal
    assert "health_score" in res_normal
    assert res_normal["health_score"] >= 80.0

    # Test Compressor Overload reading
    res_overload = ml_engine.predict(35.0, 40.0, 105.0, 14.0, 3100.0)
    assert res_overload["predicted_fault"] in ["compressor_overload", "filter_clogging"]
    assert res_overload["severity"] in ["High", "Critical"]

def test_simulation_controls():
    response = client.post("/api/simulation/scenario", json={"scenario": "FILTER_CLOGGING", "speed_multiplier": 2.0})
    assert response.status_code == 200
    data = response.json()
    assert data["scenario"] == "FILTER_CLOGGING"
    assert data["speed_multiplier"] == 2.0

def test_energy_summary():
    response = client.get("/api/energy")
    assert response.status_code == 200
    data = response.json()
    assert "current_power_w" in data
    assert "recommendation" in data

def test_auth_login():
    response = client.post("/api/auth/login", data={"username": "admin@hvac.com", "password": "admin123"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_sensors_latest():
    response = client.get("/api/sensors/latest")
    assert response.status_code == 200
    data = response.json()
    assert "temperature" in data
    assert "humidity" in data
    assert "pressure" in data
    assert "current" in data
    assert "power" in data

def test_predictions_latest():
    response = client.get("/api/predictions/latest")
    assert response.status_code == 200
    data = response.json()
    assert "predicted_fault" in data
    assert "health_score" in data
    assert "severity" in data

def test_alerts_endpoint():
    response = client.get("/api/alerts")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_commercial_remote_recommendation():
    response = client.get("/api/commercial/remote-recommendation?unit_id=HVAC-001&brand=Daikin")
    assert response.status_code == 200
    data = response.json()
    assert "recommended_mode" in data
    assert "target_temperature" in data
    assert "brand_command" in data
    assert data["brand"] == "Daikin"

def test_commercial_apply_remote():
    payload = {
        "unit_id": "HVAC-001",
        "brand": "Carrier",
        "mode": "COOL",
        "temperature": 23.5,
        "fan_speed": "AUTO"
    }
    response = client.post("/api/commercial/apply-remote", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["applied_mode"] == "COOL"
    assert data["applied_temperature"] == 23.5

def test_commercial_technician_diagnostics():
    response = client.get("/api/commercial/technician-diagnostics?unit_id=HVAC-001")
    assert response.status_code == 200
    data = response.json()
    assert "dew_point_c" in data
    assert "wet_bulb_c" in data
    assert "enthalpy_kj_kg" in data
    assert "estimated_superheat_c" in data
    assert "cop" in data
    assert "rla_pct" in data
    assert "technician_summary" in data

def test_commercial_roi_analytics():
    response = client.get("/api/commercial/roi?unit_id=HVAC-001&currency=INR")
    assert response.status_code == 200
    data = response.json()
    assert "daily_savings" in data
    assert "monthly_savings_projection" in data
    assert "co2_saved_kg_monthly" in data
    assert data["currency_symbol"] == "₹"

def test_commercial_building_zones():
    response = client.get("/api/commercial/zones")
    assert response.status_code == 200
    zones = response.json()
    assert len(zones) >= 4
    assert zones[0]["floor"] == "Floor 1"
    assert "occupancy" in zones[0]

def test_ml_inference_7_features():
    # 7-feature inference with occupancy and outdoor temperature
    res = ml_engine.predict(24.5, 52.0, 101.3, 4.2, 950.0, occupancy=12, outdoor_temp=35.0)
    assert "predicted_fault" in res
    assert "confidence" in res
    assert "predicted_power_next" in res
    assert res["predicted_power_next"] > 0

