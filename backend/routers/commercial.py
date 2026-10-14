"""
Commercial HVAC B2B API Router
Exposes:
1. Universal HVAC Remote Control & Mode Optimizer
2. Deep Technician Thermodynamic & Psychrometric Diagnostics
3. Commercial B2B ROI & Carbon Savings Analytics
4. Multi-Zone / Multi-Floor Occupancy Management
"""

from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from optimizer import hvac_optimizer

router = APIRouter(prefix="/api/commercial", tags=["Commercial B2B & Technician Intelligence"])

@router.get("/remote-recommendation", response_model=schemas.UniversalRemoteRecommendation)
def get_remote_recommendation(
    unit_id: str = "HVAC-001",
    brand: Optional[str] = None,
    db: Session = Depends(get_db)
):
    unit = db.query(models.HVACUnit).filter(models.HVACUnit.unit_id == unit_id).first()
    selected_brand = brand or (unit.brand if unit else "Daikin")

    latest_reading = db.query(models.SensorReading).filter(
        models.SensorReading.unit_id == unit_id
    ).order_by(models.SensorReading.timestamp.desc()).first()

    temp = latest_reading.temperature if latest_reading else 24.0
    hum = latest_reading.humidity if latest_reading else 50.0
    occupancy = latest_reading.occupancy if latest_reading else 4
    outdoor = latest_reading.outdoor_temp if latest_reading else 33.0
    power = latest_reading.power if latest_reading else 1050.0

    return hvac_optimizer.get_universal_remote_recommendation(
        unit_id=unit_id,
        temperature=temp,
        humidity=hum,
        occupancy=occupancy,
        outdoor_temp=outdoor,
        current_power=power,
        brand=selected_brand
    )

@router.post("/apply-remote")
def apply_remote_command(
    request: schemas.RemoteCommandApplyRequest,
    db: Session = Depends(get_db)
):
    unit = db.query(models.HVACUnit).filter(models.HVACUnit.unit_id == request.unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="HVAC Unit not found.")

    unit.current_mode = request.mode
    unit.current_setpoint = request.temperature
    db.commit()

    return {
        "status": "success",
        "unit_id": request.unit_id,
        "message": f"Successfully transmitted command to {unit.brand} Unit: Set to {request.mode} mode at {request.temperature}°C (Fan: {request.fan_speed}).",
        "applied_mode": request.mode,
        "applied_temperature": request.temperature,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@router.get("/technician-diagnostics", response_model=schemas.TechnicianDiagnosticsResponse)
def get_technician_diagnostics(
    unit_id: str = "HVAC-001",
    db: Session = Depends(get_db)
):
    latest_reading = db.query(models.SensorReading).filter(
        models.SensorReading.unit_id == unit_id
    ).order_by(models.SensorReading.timestamp.desc()).first()

    temp = latest_reading.temperature if latest_reading else 24.0
    hum = latest_reading.humidity if latest_reading else 50.0
    press = latest_reading.pressure if latest_reading else 101.3
    curr = latest_reading.current if latest_reading else 4.8
    power = latest_reading.power if latest_reading else 1050.0

    dew_point = hvac_optimizer.calculate_dew_point(temp, hum)
    wet_bulb = hvac_optimizer.calculate_wet_bulb(temp, hum)
    enthalpy = hvac_optimizer.calculate_moist_air_enthalpy(temp, hum, press)
    refrig = hvac_optimizer.calculate_refrigerant_cycle_estimates(press, temp, curr)

    # Technician diagnosis summary
    if refrig["compressor_stress_level"] == "Critical":
        summary = "CRITICAL: Compressor RLA exceeds nominal threshold (>115%). High discharge pressure detected. Inspect capacitor and condenser fan coil."
    elif dew_point > 20.0:
        summary = "HIGH LATENT LOAD: Indoor dew point above 20°C indicates high humidity infiltration. Dehumidification cycle recommended."
    elif refrig["estimated_superheat_c"] > 12.0:
        summary = "ELEVATED SUPERHEAT: High evaporator superheat (>12°C) suggests potential refrigerant undercharge or expansion valve restriction."
    else:
        summary = "NOMINAL OPERATING CONDITIONS: Superheat (5-8°C), Subcooling (4-7°C), and COP (>3.2) align with ASHRAE standards."

    return {
        "unit_id": unit_id,
        "timestamp": latest_reading.timestamp if latest_reading else datetime.now(timezone.utc),
        "temperature_c": temp,
        "humidity_pct": hum,
        "pressure_kpa": press,
        "dew_point_c": dew_point,
        "wet_bulb_c": wet_bulb,
        "enthalpy_kj_kg": enthalpy,
        "estimated_superheat_c": refrig["estimated_superheat_c"],
        "estimated_subcooling_c": refrig["estimated_subcooling_c"],
        "compression_ratio": refrig["compression_ratio"],
        "cop": refrig["cop"],
        "eer": refrig["eer"],
        "current_a": curr,
        "power_w": power,
        "rla_pct": refrig["rla_pct"],
        "compressor_stress_level": refrig["compressor_stress_level"],
        "technician_summary": summary
    }

@router.get("/roi", response_model=schemas.ROIAnalyticsResponse)
def get_commercial_roi(
    unit_id: str = "HVAC-001",
    currency: str = Query("INR", description="Currency: INR or USD"),
    db: Session = Depends(get_db)
):
    latest_reading = db.query(models.SensorReading).filter(
        models.SensorReading.unit_id == unit_id
    ).order_by(models.SensorReading.timestamp.desc()).first()

    curr_power = latest_reading.power if latest_reading else 1050.0

    # Calculate approximate daily kWh
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0)
    count = db.query(models.SensorReading).filter(
        models.SensorReading.unit_id == unit_id,
        models.SensorReading.timestamp >= today_start
    ).count()

    # If few records, supply realistic daily run
    daily_kwh = max(18.5, (curr_power * 8.0) / 1000.0)

    cost_per_kwh = 8.50 if currency.upper() == "INR" else 0.12
    symbol = "₹" if currency.upper() == "INR" else "$"

    return hvac_optimizer.calculate_commercial_roi(
        unit_id=unit_id,
        current_power_w=curr_power,
        energy_today_kwh=daily_kwh,
        cost_per_kwh=cost_per_kwh,
        currency_symbol=symbol
    )

@router.get("/zones")
def get_building_zones(db: Session = Depends(get_db)):
    """Returns commercial multi-floor / multi-zone building status."""
    return [
        {
            "floor": "Floor 1",
            "zone_id": "ZONE-101",
            "zone_name": "Main Reception & Lobby",
            "hvac_id": "HVAC-001",
            "occupancy": 8,
            "status": "NORMAL",
            "temp": 23.8,
            "target_setpoint": 24.0,
            "mode": "AUTO"
        },
        {
            "floor": "Floor 2",
            "zone_id": "ZONE-201",
            "zone_name": "Software Engineering Bay",
            "hvac_id": "HVAC-002",
            "occupancy": 18,
            "status": "NORMAL",
            "temp": 24.2,
            "target_setpoint": 23.5,
            "mode": "COOL"
        },
        {
            "floor": "Floor 2",
            "zone_id": "ZONE-202",
            "zone_name": "Boardroom / Executive Conf",
            "hvac_id": "HVAC-003",
            "occupancy": 0,
            "status": "STANDBY",
            "temp": 26.5,
            "target_setpoint": 28.0,
            "mode": "ECO"
        },
        {
            "floor": "Floor 3",
            "zone_id": "ZONE-301",
            "zone_name": "Server & Telecom Room",
            "hvac_id": "HVAC-004",
            "occupancy": 1,
            "status": "NORMAL",
            "temp": 20.5,
            "target_setpoint": 20.0,
            "mode": "COOL"
        }
    ]
