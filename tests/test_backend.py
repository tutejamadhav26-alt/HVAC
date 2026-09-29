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
