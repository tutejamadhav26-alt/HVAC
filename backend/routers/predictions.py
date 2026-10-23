from typing import List, Optional
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from ml_engine import ml_engine
from optimizer import hvac_optimizer
from adapters.factory import get_adapter_for_unit
from adapters.base import HVACCommand

router = APIRouter(prefix="/api/predictions", tags=["ML Predictions & AI Recommendations"])


@router.get("/latest", response_model=schemas.PredictionResponse)
def get_latest_prediction(unit_id: str = "HVAC-001", db: Session = Depends(get_db)):
    prediction = db.query(models.Prediction).filter(
        models.Prediction.unit_id == unit_id
    ).order_by(models.Prediction.timestamp.desc()).first()

    if not prediction:
        raise HTTPException(status_code=404, detail="No ML predictions generated yet.")
    return prediction


@router.get("/history", response_model=List[schemas.PredictionResponse])
def get_predictions_history(
    unit_id: str = "HVAC-001",
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db)
):
    predictions = db.query(models.Prediction).filter(
        models.Prediction.unit_id == unit_id
    ).order_by(models.Prediction.timestamp.desc()).limit(limit).all()

    return predictions


@router.get("/unified-recommendation")
def get_unified_recommendation(
    unit_id: str = "HVAC-001",
    db: Session = Depends(get_db)
):
    unit = db.query(models.HVACUnit).filter(models.HVACUnit.unit_id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail=f"HVAC Unit '{unit_id}' not found.")

    latest_reading = db.query(models.SensorReading).filter(
        models.SensorReading.unit_id == unit_id
    ).order_by(models.SensorReading.timestamp.desc()).first()

    temp = latest_reading.temperature if latest_reading else 24.5
    hum = latest_reading.humidity if latest_reading else 52.0
    press = latest_reading.pressure if latest_reading else 101.3
    curr = latest_reading.current if latest_reading else 4.5
    pow_w = latest_reading.power if latest_reading else 990.0
    occ = latest_reading.occupancy if latest_reading else 4
    out_temp = latest_reading.outdoor_temp if latest_reading else 32.5

    # 1. Genuine ML Model Inference (Preserved Trained Model)
    ml_result = ml_engine.predict(
        temperature=temp,
        humidity=hum,
        pressure=press,
        current=curr,
        power=pow_w,
        occupancy=occ,
        outdoor_temp=out_temp
    )

    # 2. Transparent ASHRAE-55 Comfort & Efficiency Setpoint Recommendation Strategy
    brand = unit.brand or "Daikin"
    rec_strategy = hvac_optimizer.get_universal_remote_recommendation(
        unit_id=unit_id,
        temperature=temp,
        humidity=hum,
        occupancy=occ,
        outdoor_temp=out_temp,
        current_power=pow_w,
        brand=brand
    )

    rec_temp = rec_strategy["target_temperature"]
    rec_mode = rec_strategy["recommended_mode"]
    rec_fan = rec_strategy["fan_speed"]

    # Compare recommended vs current
    current_setpoint = unit.current_setpoint or 24.0
    delta = round(abs(rec_temp - current_setpoint), 1)

    rec_status = "pending"
    if delta < 0.3 and unit.current_mode == rec_mode:
        rec_status = "already_optimal"

    # Adapter capabilities
    adapter = get_adapter_for_unit(unit.unit_id, unit.controller_type, unit.connection_params)
    caps = adapter.get_capabilities()

    return {
        "unit_id": unit.unit_id,
        "unit_name": unit.name,
        "brand": unit.brand,
        "current_conditions": {
            "temperature": round(temp, 1),
            "humidity": round(hum, 1),
            "pressure": round(press, 1),
            "current": round(curr, 2),
            "power": round(pow_w, 1),
            "occupancy": occ,
            "outdoor_temp": round(out_temp, 1),
            "current_setpoint": current_setpoint,
            "current_mode": unit.current_mode or "AUTO",
            "current_fan_speed": unit.fan_speed or "AUTO",
            "power_state": unit.power_state if unit.power_state is not None else True,
            "sensor_update_time": latest_reading.timestamp.isoformat() if latest_reading and latest_reading.timestamp else datetime.now(timezone.utc).isoformat(),
            "data_source": "SIMULATED" if (not latest_reading or unit.controller_type == "simulator") else "LIVE_CONTROLLER"
        },
        "ml_model_diagnosis": {
            "model_type": "RandomForest & IsolationForest Ingest Engine",
            "predicted_fault": ml_result.get("predicted_fault", "normal"),
            "confidence": ml_result.get("confidence", 95.0),
            "anomaly_score": ml_result.get("anomaly_score", 0.05),
            "is_anomaly": ml_result.get("is_anomaly", False),
            "health_score": ml_result.get("health_score", 95.0),
            "predicted_power_next_w": ml_result.get("predicted_power_next", pow_w),
            "severity": ml_result.get("severity", "Low"),
            "input_features_used": [
                {"name": "temperature", "value": temp, "unit": "°C"},
                {"name": "humidity", "value": hum, "unit": "% RH"},
                {"name": "pressure", "value": press, "unit": "kPa"},
                {"name": "current", "value": curr, "unit": "A"},
                {"name": "power", "value": pow_w, "unit": "W"},
                {"name": "occupancy", "value": occ, "unit": "people"},
                {"name": "outdoor_temp", "value": out_temp, "unit": "°C"}
            ]
        },
        "setpoint_recommendation": {
            "target_temperature": rec_temp,
            "recommended_mode": rec_mode,
            "fan_speed": rec_fan,
            "energy_saving_pct": rec_strategy.get("energy_saving_pct", 15.0),
            "thermal_status": rec_strategy.get("thermal_status", "Optimal"),
            "rationale": rec_strategy.get("rationale", "Optimal comfort balance according to ASHRAE 55 standards."),
            "dew_point_c": rec_strategy.get("dew_point", 13.5),
            "limits": {
                "min": caps.min_temperature,
                "max": caps.max_temperature
            }
        },
        "strategy_distinction": {
            "ml_model_scope": "Fault classification (normal, filter_clogging, compressor_overload, refrigerant_leakage) and multivariate anomaly detection.",
            "setpoint_strategy_scope": "ASHRAE-55 psychrometric thermal comfort & energy optimization rule strategy.",
            "note": "The ML model does not predict temperature setpoints directly. The setpoint recommendation is transparently separated and derived from occupancy, outdoor temperature, psychrometric comfort bounds, and equipment condition."
        },
        "recommendation_status": rec_status,
        "auto_mode_status": {
            "unit_auto_enabled": unit.auto_mode_enabled or False,
            "temperature_delta": delta,
            "safe_to_apply": caps.min_temperature <= rec_temp <= caps.max_temperature
        },
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@router.post("/apply-recommendation")
def apply_recommendation(
    unit_id: str,
    target_temperature: Optional[float] = None,
    mode: Optional[str] = None,
    fan_speed: Optional[str] = None,
    triggered_by: str = "manual",
    db: Session = Depends(get_db)
):
    unit = db.query(models.HVACUnit).filter(models.HVACUnit.unit_id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="HVAC Unit not found.")

    adapter = get_adapter_for_unit(unit.unit_id, unit.controller_type, unit.connection_params)

    # If parameters not passed, fetch optimal recommendation
    if target_temperature is None or mode is None:
        rec_data = get_unified_recommendation(unit_id=unit_id, db=db)
        target_temperature = rec_data["setpoint_recommendation"]["target_temperature"]
        mode = rec_data["setpoint_recommendation"]["recommended_mode"]
        fan_speed = rec_data["setpoint_recommendation"]["fan_speed"]

    # Send command through controller adapter
    cmd = HVACCommand(
        power_state=True,
        target_temperature=target_temperature,
        mode=mode,
        fan_speed=fan_speed
    )
    cmd_res = adapter.send_command(cmd)

    if not cmd_res.success:
        raise HTTPException(status_code=400, detail=cmd_res.message)

    # Update unit record
    unit.current_setpoint = target_temperature
    unit.current_mode = mode
    unit.fan_speed = fan_speed
    unit.last_command_at = datetime.now(timezone.utc)
    unit.last_command_result = json.dumps(cmd_res.applied_state)

    # Log command
    log = models.HVACCommandLog(
        unit_id=unit_id,
        triggered_by=triggered_by,
        target_temperature=target_temperature,
        mode=mode,
        fan_speed=fan_speed,
        power_state=True,
        success=True,
        message=cmd_res.message
    )
    db.add(log)
    db.commit()

    return {
        "status": "success",
        "unit_id": unit_id,
        "applied_setpoint": target_temperature,
        "applied_mode": mode,
        "applied_fan_speed": fan_speed,
        "triggered_by": triggered_by,
        "adapter_message": cmd_res.message,
        "timestamp": cmd_res.timestamp
    }
