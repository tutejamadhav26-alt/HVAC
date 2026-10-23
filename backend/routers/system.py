from typing import Dict, Any, Optional, List
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, Body, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from ml_engine import ml_engine
from simulator import simulator
from mqtt_client import mqtt_manager
from adapters.factory import get_adapter_for_unit
from adapters.base import HVACCommand
from optimizer import hvac_optimizer

router = APIRouter(tags=["System Status, Settings & Control Limits"])


@router.get("/api/health")
def health_check():
    return {"status": "ok", "service": "Smart HVAC Monitoring & Remote Control Platform"}


@router.get("/api/system/status", response_model=schemas.SystemStatusResponse)
def get_system_status(db: Session = Depends(get_db)):
    active_hvac_count = db.query(models.HVACUnit).count()
    total_readings_count = db.query(models.SensorReading).count()
    active_alerts_count = db.query(models.Alert).filter(models.Alert.is_resolved == False).count()

    return {
        "status": "OPERATIONAL",
        "backend_version": "2.0.0 (Simplified Remote Control & Monitoring)",
        "db_connected": True,
        "ml_models_loaded": ml_engine.models_loaded,
        "simulator_active": simulator.is_running,
        "mqtt_connected": mqtt_manager.is_connected,
        "active_hvac_units": active_hvac_count,
        "total_readings": total_readings_count,
        "active_alerts": active_alerts_count
    }


def _get_setting(db: Session, key: str, default: str) -> str:
    item = db.query(models.SystemSettings).filter(models.SystemSettings.setting_key == key).first()
    return item.setting_value if item else default


def _set_setting(db: Session, key: str, val: str):
    item = db.query(models.SystemSettings).filter(models.SystemSettings.setting_key == key).first()
    if item:
        item.setting_value = val
    else:
        item = models.SystemSettings(setting_key=key, setting_value=val)
        db.add(item)
    db.commit()


@router.get("/api/system/settings")
def get_control_settings(db: Session = Depends(get_db)):
    return {
        "min_allowable_setpoint": float(_get_setting(db, "min_allowable_setpoint", "18.0")),
        "max_allowable_setpoint": float(_get_setting(db, "max_allowable_setpoint", "28.0")),
        "auto_mode_global_enabled": _get_setting(db, "auto_mode_global_enabled", "false").lower() == "true",
        "auto_mode_min_interval_minutes": int(_get_setting(db, "auto_mode_min_interval_minutes", "15")),
        "auto_mode_min_temp_diff": float(_get_setting(db, "auto_mode_min_temp_diff", "1.0")),
        "default_bms_gateway_ip": _get_setting(db, "default_bms_gateway_ip", "192.168.1.100"),
        "default_vrf_port": int(_get_setting(db, "default_vrf_port", "10102"))
    }


@router.put("/api/system/settings")
def update_control_settings(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    if "min_allowable_setpoint" in payload:
        _set_setting(db, "min_allowable_setpoint", str(payload["min_allowable_setpoint"]))
    if "max_allowable_setpoint" in payload:
        _set_setting(db, "max_allowable_setpoint", str(payload["max_allowable_setpoint"]))
    if "auto_mode_global_enabled" in payload:
        _set_setting(db, "auto_mode_global_enabled", str(bool(payload["auto_mode_global_enabled"])).lower())
    if "auto_mode_min_interval_minutes" in payload:
        _set_setting(db, "auto_mode_min_interval_minutes", str(payload["auto_mode_min_interval_minutes"]))
    if "auto_mode_min_temp_diff" in payload:
        _set_setting(db, "auto_mode_min_temp_diff", str(payload["auto_mode_min_temp_diff"]))
    if "default_bms_gateway_ip" in payload:
        _set_setting(db, "default_bms_gateway_ip", str(payload["default_bms_gateway_ip"]))
    if "default_vrf_port" in payload:
        _set_setting(db, "default_vrf_port", str(payload["default_vrf_port"]))

    return {"status": "success", "message": "Settings updated successfully."}


@router.get("/api/system/audit-logs")
def get_system_audit_logs(limit: int = 50, db: Session = Depends(get_db)):
    logs = db.query(models.HVACCommandLog).order_by(
        models.HVACCommandLog.timestamp.desc()
    ).limit(limit).all()

    return [
        {
            "id": log.id,
            "unit_id": log.unit_id,
            "triggered_by": log.triggered_by,
            "user_email": log.user_email,
            "target_temperature": log.target_temperature,
            "mode": log.mode,
            "fan_speed": log.fan_speed,
            "power_state": log.power_state,
            "success": log.success,
            "message": log.message,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None
        }
        for log in logs
    ]


@router.post("/api/system/evaluate-auto-mode")
def evaluate_auto_mode(db: Session = Depends(get_db)):
    """
    Evaluates pending recommendations for all units that have auto_mode_enabled=True.
    Applies changes only if within safe bounds, and logs each operation.
    """
    global_enabled = _get_setting(db, "auto_mode_global_enabled", "false").lower() == "true"
    min_interval = int(_get_setting(db, "auto_mode_min_interval_minutes", "15"))
    min_diff = float(_get_setting(db, "auto_mode_min_temp_diff", "1.0"))
    min_limit = float(_get_setting(db, "min_allowable_setpoint", "18.0"))
    max_limit = float(_get_setting(db, "max_allowable_setpoint", "28.0"))

    units = db.query(models.HVACUnit).filter(models.HVACUnit.auto_mode_enabled == True).all()
    actions_taken = []

    for unit in units:
        # Check last command time to avoid cycling
        if unit.last_command_at:
            delta_time = (datetime.now(timezone.utc) - unit.last_command_at.replace(tzinfo=timezone.utc)).total_seconds()
            if delta_time < min_interval * 60:
                continue

        # Get reading
        latest_reading = db.query(models.SensorReading).filter(
            models.SensorReading.unit_id == unit.unit_id
        ).order_by(models.SensorReading.timestamp.desc()).first()

        temp = latest_reading.temperature if latest_reading else 24.5
        hum = latest_reading.humidity if latest_reading else 50.0
        occ = latest_reading.occupancy if latest_reading else 4
        out_temp = latest_reading.outdoor_temp if latest_reading else 32.0
        pow_w = latest_reading.power if latest_reading else 1000.0

        rec = hvac_optimizer.get_universal_remote_recommendation(
            unit_id=unit.unit_id,
            temperature=temp,
            humidity=hum,
            occupancy=occ,
            outdoor_temp=out_temp,
            current_power=pow_w,
            brand=unit.brand or "Daikin"
        )

        rec_temp = rec["target_temperature"]
        rec_mode = rec["recommended_mode"]
        rec_fan = rec["fan_speed"]

        # Clamp to safety limits
        clamped_temp = max(min_limit, min(max_limit, rec_temp))

        # Check threshold
        if abs(clamped_temp - (unit.current_setpoint or 24.0)) >= min_diff or unit.current_mode != rec_mode:
            adapter = get_adapter_for_unit(unit.unit_id, unit.controller_type, unit.connection_params)
            cmd = HVACCommand(
                power_state=True,
                target_temperature=clamped_temp,
                mode=rec_mode,
                fan_speed=rec_fan
            )
            cmd_res = adapter.send_command(cmd)

            unit.current_setpoint = clamped_temp
            unit.current_mode = rec_mode
            unit.fan_speed = rec_fan
            unit.last_command_at = datetime.now(timezone.utc)

            log = models.HVACCommandLog(
                unit_id=unit.unit_id,
                triggered_by="ai_auto",
                target_temperature=clamped_temp,
                mode=rec_mode,
                fan_speed=rec_fan,
                power_state=True,
                success=cmd_res.success,
                message=f"[Auto-Mode] {cmd_res.message}"
            )
            db.add(log)
            actions_taken.append({
                "unit_id": unit.unit_id,
                "applied_temp": clamped_temp,
                "applied_mode": rec_mode,
                "rationale": rec["rationale"]
            })

    db.commit()
    return {
        "status": "success",
        "global_auto_enabled": global_enabled,
        "actions_taken": actions_taken,
        "total_evaluated": len(units)
    }
