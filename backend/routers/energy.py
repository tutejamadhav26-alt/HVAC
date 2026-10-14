from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
import models
import schemas

router = APIRouter(tags=["Energy & Analytics"])

@router.get("/api/energy", response_model=schemas.EnergySummaryResponse)
def get_energy_summary(unit_id: str = "HVAC-001", db: Session = Depends(get_db)):
    # Calculate real energy statistics from database sensor readings
    latest_reading = db.query(models.SensorReading).filter(
        models.SensorReading.unit_id == unit_id
    ).order_by(models.SensorReading.timestamp.desc()).first()

    current_power = latest_reading.power if latest_reading else 1050.0

    now = datetime.now(timezone.utc)
    today_start = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)
    week_start = now - timedelta(days=7)

    # Average and Peak power today
    stats_today = db.query(
        func.avg(models.SensorReading.power).label("avg_p"),
        func.max(models.SensorReading.power).label("max_p"),
        func.count(models.SensorReading.id).label("cnt")
    ).filter(
        models.SensorReading.unit_id == unit_id,
        models.SensorReading.timestamp >= today_start
    ).first()

    avg_power = float(stats_today.avg_p or current_power)
    peak_power = float(stats_today.max_p or current_power)

    # Convert average W to kWh based on elapsed hours
    hours_today = max(1.0, (now - today_start).total_seconds() / 3600.0)
    energy_today_kwh = round((avg_power * hours_today) / 1000.0, 2)

    # Week energy
    stats_week = db.query(
        func.avg(models.SensorReading.power).label("avg_p")
    ).filter(
        models.SensorReading.unit_id == unit_id,
        models.SensorReading.timestamp >= week_start
    ).first()
    avg_week_p = float(stats_week.avg_p or avg_power)
    energy_week_kwh = round((avg_week_p * 24.0 * 7.0) / 1000.0, 2)

    # Generate genuine recommendation based on current vs baseline power
    if current_power > avg_power * 1.3:
        recommendation = f"Current energy consumption ({current_power:.0f} W) is 30%+ above today's operating baseline ({avg_power:.0f} W). Inspect HVAC filter and compressor loading."
    elif current_power > 2000.0:
        recommendation = f"High power demand spike detected ({current_power:.0f} W). Consider load-shedding non-critical zones."
    else:
        recommendation = "Energy consumption is within expected baseline bounds. HVAC system operating efficiently."

    return {
        "unit_id": unit_id,
        "current_power_w": round(current_power, 1),
        "energy_today_kwh": energy_today_kwh,
        "energy_week_kwh": energy_week_kwh,
        "avg_power_w": round(avg_power, 1),
        "peak_power_w": round(peak_power, 1),
        "recommendation": recommendation
    }

@router.get("/api/analytics")
def get_analytics(unit_id: str = "HVAC-001", db: Session = Depends(get_db)):
    total_readings = db.query(models.SensorReading).filter(models.SensorReading.unit_id == unit_id).count()
    total_anomalies = db.query(models.Prediction).filter(
        models.Prediction.unit_id == unit_id,
        models.Prediction.is_anomaly == True
    ).count()
    total_alerts = db.query(models.Alert).filter(models.Alert.unit_id == unit_id).count()

    latest_pred = db.query(models.Prediction).filter(
        models.Prediction.unit_id == unit_id
    ).order_by(models.Prediction.timestamp.desc()).first()

    health_score = latest_pred.health_score if latest_pred else 100.0

    return {
        "unit_id": unit_id,
        "total_readings": total_readings,
        "total_anomalies": total_anomalies,
        "total_alerts": total_alerts,
        "current_health_score": health_score,
        "efficiency_index": f"{min(100.0, max(0.0, health_score * 0.95)):.1f}%"
    }
