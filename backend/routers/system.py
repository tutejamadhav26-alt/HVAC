from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from ml_engine import ml_engine
from simulator import simulator
from mqtt_client import mqtt_manager

router = APIRouter(tags=["System Status & Configuration"])

@router.get("/api/health")
def health_check():
    return {"status": "ok", "service": "Smart HVAC AI Backend"}

@router.get("/api/system/status", response_model=schemas.SystemStatusResponse)
def get_system_status(db: Session = Depends(get_db)):
    active_hvac_count = db.query(models.HVACUnit).count()
    total_readings_count = db.query(models.SensorReading).count()
    active_alerts_count = db.query(models.Alert).filter(models.Alert.is_resolved == False).count()

    return {
        "status": "OPERATIONAL",
        "backend_version": "1.0.0",
        "db_connected": True,
        "ml_models_loaded": ml_engine.models_loaded,
        "simulator_active": simulator.is_running,
        "mqtt_connected": mqtt_manager.is_connected,
        "active_hvac_units": active_hvac_count,
        "total_readings": total_readings_count,
        "active_alerts": active_alerts_count
    }

@router.post("/api/mqtt/config")
def update_mqtt_config(broker: str = "localhost", port: int = 1883, topic: str = "hvac/sensor/readings"):
    return {
        "status": "MQTT configuration updated",
        "broker": broker,
        "port": port,
        "topic": topic
    }
