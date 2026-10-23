from typing import List, Optional
import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from adapters.base import HVACCommand
from adapters.factory import get_adapter_for_unit

router = APIRouter(prefix="/api/hvac", tags=["HVAC Units & Controller Integration"])


@router.get("", response_model=List[schemas.HVACUnitResponse])
def get_all_hvac_units(db: Session = Depends(get_db)):
    units = db.query(models.HVACUnit).all()
    if not units:
        # Create default Commercial HVAC-001 unit
        default_unit = models.HVACUnit(
            unit_id="HVAC-001",
            name="Main Commercial Central / VRF Air Handler",
            location="Building A - Mech Floor 2",
            building_floor="Floor 2",
            zone_type="Commercial Office / Conference",
            brand="Daikin",
            current_setpoint=24.0,
            current_mode="AUTO",
            fan_speed="AUTO",
            power_state=True,
            status="NORMAL",
            controller_type="vrf_vrv",
            connection_params=json.dumps({
                "brand": "Daikin VRV",
                "gateway_type": "CoolMasterNet/Intesis",
                "host": "",
                "port": 10102,
                "indoor_unit_address": "101"
            }),
            connection_status="UNCONFIGURED",
            auto_mode_enabled=False
        )
        db.add(default_unit)
        db.commit()
        db.refresh(default_unit)
        units = [default_unit]
    return units


@router.post("", response_model=schemas.HVACUnitResponse, status_code=status.HTTP_201_CREATED)
def create_hvac_unit(unit_in: schemas.HVACUnitCreate, db: Session = Depends(get_db)):
    existing = db.query(models.HVACUnit).filter(models.HVACUnit.unit_id == unit_in.unit_id).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"HVAC Unit ID '{unit_in.unit_id}' already exists.")

    unit = models.HVACUnit(
        unit_id=unit_in.unit_id,
        name=unit_in.name,
        location=unit_in.location,
        building_floor=unit_in.building_floor or "Floor 1",
        zone_type=unit_in.zone_type or "General Commercial Zone",
        brand=unit_in.brand or "Daikin",
        current_setpoint=unit_in.current_setpoint or 24.0,
        current_mode=unit_in.current_mode or "AUTO",
        fan_speed=unit_in.fan_speed or "AUTO",
        power_state=unit_in.power_state if unit_in.power_state is not None else True,
        status="NORMAL",
        controller_type=unit_in.controller_type or "simulator",
        connection_params=unit_in.connection_params or "{}",
        connection_status="SIMULATED" if unit_in.controller_type == "simulator" else "UNCONFIGURED",
        auto_mode_enabled=unit_in.auto_mode_enabled or False
    )
    db.add(unit)
    db.commit()
    db.refresh(unit)
    return unit


@router.get("/{unit_id}", response_model=schemas.HVACUnitResponse)
def get_hvac_unit_by_id(unit_id: str, db: Session = Depends(get_db)):
    unit = db.query(models.HVACUnit).filter(models.HVACUnit.unit_id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="HVAC Unit not found")
    return unit


@router.put("/{unit_id}", response_model=schemas.HVACUnitResponse)
def update_hvac_unit(unit_id: str, unit_update: schemas.HVACUnitUpdate, db: Session = Depends(get_db)):
    unit = db.query(models.HVACUnit).filter(models.HVACUnit.unit_id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="HVAC Unit not found")

    if unit_update.name is not None:
        unit.name = unit_update.name
    if unit_update.location is not None:
        unit.location = unit_update.location
    if unit_update.building_floor is not None:
        unit.building_floor = unit_update.building_floor
    if unit_update.zone_type is not None:
        unit.zone_type = unit_update.zone_type
    if unit_update.brand is not None:
        unit.brand = unit_update.brand
    if unit_update.controller_type is not None:
        unit.controller_type = unit_update.controller_type
    if unit_update.connection_params is not None:
        unit.connection_params = unit_update.connection_params
    if unit_update.auto_mode_enabled is not None:
        unit.auto_mode_enabled = unit_update.auto_mode_enabled

    # Re-evaluate connection status with updated adapter
    adapter = get_adapter_for_unit(unit.unit_id, unit.controller_type, unit.connection_params)
    conn_result = adapter.test_connection()
    unit.connection_status = conn_result["status"]

    db.commit()
    db.refresh(unit)
    return unit


@router.delete("/{unit_id}")
def delete_hvac_unit(unit_id: str, db: Session = Depends(get_db)):
    unit = db.query(models.HVACUnit).filter(models.HVACUnit.unit_id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="HVAC Unit not found")
    db.delete(unit)
    db.commit()
    return {"status": "success", "message": f"HVAC Unit '{unit_id}' removed."}


@router.get("/{unit_id}/capabilities", response_model=schemas.DeviceCapabilitiesResponse)
def get_device_capabilities(unit_id: str, db: Session = Depends(get_db)):
    unit = db.query(models.HVACUnit).filter(models.HVACUnit.unit_id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="HVAC Unit not found")

    adapter = get_adapter_for_unit(unit.unit_id, unit.controller_type, unit.connection_params)
    caps = adapter.get_capabilities()

    return schemas.DeviceCapabilitiesResponse(
        unit_id=unit.unit_id,
        controller_type=unit.controller_type or "simulator",
        supported_modes=caps.supported_modes,
        min_temperature=caps.min_temperature,
        max_temperature=caps.max_temperature,
        temperature_step=caps.temperature_step,
        supported_fan_speeds=caps.supported_fan_speeds,
        supports_power_toggle=caps.supports_power_toggle,
        supports_auto_mode=caps.supports_auto_mode,
        protocol_name=caps.protocol_name
    )


@router.post("/{unit_id}/test-connection", response_model=schemas.ConnectionTestResult)
def test_controller_connection(unit_id: str, db: Session = Depends(get_db)):
    unit = db.query(models.HVACUnit).filter(models.HVACUnit.unit_id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="HVAC Unit not found")

    adapter = get_adapter_for_unit(unit.unit_id, unit.controller_type, unit.connection_params)
    result = adapter.test_connection()

    # Persist latest verified status
    unit.connection_status = result["status"]
    db.commit()

    return schemas.ConnectionTestResult(
        connected=result["connected"],
        status=result["status"],
        message=result["message"]
    )


@router.post("/{unit_id}/command", response_model=schemas.HVACRemoteCommandResponse)
def execute_remote_command(
    unit_id: str,
    cmd_req: schemas.HVACRemoteCommandRequest,
    db: Session = Depends(get_db)
):
    unit = db.query(models.HVACUnit).filter(models.HVACUnit.unit_id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="HVAC Unit not found")

    adapter = get_adapter_for_unit(unit.unit_id, unit.controller_type, unit.connection_params)

    # Construct adapter command
    cmd = HVACCommand(
        power_state=cmd_req.power_state,
        target_temperature=cmd_req.target_temperature,
        mode=cmd_req.mode,
        fan_speed=cmd_req.fan_speed
    )

    # Execute command through adapter
    res = adapter.send_command(cmd)

    if not res.success:
        raise HTTPException(status_code=400, detail=res.message)

    # Update database record with applied state
    if "power_state" in res.applied_state:
        unit.power_state = res.applied_state["power_state"]
    if "target_temperature" in res.applied_state:
        unit.current_setpoint = res.applied_state["target_temperature"]
    if "mode" in res.applied_state:
        unit.current_mode = res.applied_state["mode"]
    if "fan_speed" in res.applied_state:
        unit.fan_speed = res.applied_state["fan_speed"]

    unit.last_command_result = json.dumps(res.applied_state)
    unit.last_command_at = datetime.now(timezone.utc)

    # Log command for auditable trail
    log_entry = models.HVACCommandLog(
        unit_id=unit.unit_id,
        triggered_by=cmd_req.triggered_by or "manual",
        target_temperature=cmd_req.target_temperature,
        mode=cmd_req.mode,
        fan_speed=cmd_req.fan_speed,
        power_state=cmd_req.power_state,
        success=res.success,
        message=res.message
    )
    db.add(log_entry)
    db.commit()

    return schemas.HVACRemoteCommandResponse(
        success=True,
        unit_id=unit.unit_id,
        message=res.message,
        applied_state=res.applied_state,
        timestamp=res.timestamp
    )


@router.get("/{unit_id}/command-logs")
def get_command_logs(unit_id: str, limit: int = 20, db: Session = Depends(get_db)):
    logs = db.query(models.HVACCommandLog).filter(
        models.HVACCommandLog.unit_id == unit_id
    ).order_by(models.HVACCommandLog.timestamp.desc()).limit(limit).all()

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
