from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/sensors", tags=["Sensors"])

@router.get("/latest", response_model=schemas.SensorReadingResponse)
def get_latest_sensor_reading(unit_id: str = "HVAC-001", db: Session = Depends(get_db)):
    reading = db.query(models.SensorReading).filter(
        models.SensorReading.unit_id == unit_id
    ).order_by(models.SensorReading.timestamp.desc()).first()
    
    if not reading:
        raise HTTPException(status_code=404, detail="No sensor readings available yet.")
    return reading

@router.get("/history", response_model=List[schemas.SensorReadingResponse])
def get_sensor_history(
    unit_id: str = "HVAC-001",
    timeframe: str = Query("1h", description="Timeframe: 1h, 6h, 24h, 7d"),
    limit: int = Query(200, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    now = datetime.utcnow()
    delta_map = {
        "1h": timedelta(hours=1),
        "6h": timedelta(hours=6),
        "24h": timedelta(hours=24),
        "7d": timedelta(days=7)
    }
    cutoff = now - delta_map.get(timeframe, timedelta(hours=1))

    readings = db.query(models.SensorReading).filter(
        models.SensorReading.unit_id == unit_id,
        models.SensorReading.timestamp >= cutoff
    ).order_by(models.SensorReading.timestamp.asc()).limit(limit).all()

    if not readings:
        readings = db.query(models.SensorReading).filter(
            models.SensorReading.unit_id == unit_id
        ).order_by(models.SensorReading.timestamp.desc()).limit(limit).all()
        readings.reverse()

    return readings
