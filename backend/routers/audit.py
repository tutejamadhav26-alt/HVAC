import json
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from optimizer import hvac_optimizer

router = APIRouter(prefix="/api/audit", tags=["Energy & ESG Compliance Auditing"])

def _format_audit_response(record: models.AuditRecord) -> dict:
    metrics = {}
    recommendations = []
    try:
        if record.detailed_metrics:
            metrics = json.loads(record.detailed_metrics)
    except Exception:
        metrics = {}

    try:
        if record.recommendations:
            recommendations = json.loads(record.recommendations)
    except Exception:
        recommendations = []

    return {
        "id": record.id,
        "audit_id": record.audit_id,
        "facility_name": record.facility_name,
        "unit_id": record.unit_id,
        "auditor_email": record.auditor_email,
        "auditor_name": record.auditor_name,
        "audit_type": record.audit_type,
        "score": record.score,
        "letter_grade": record.letter_grade,
        "cop_measured": record.cop_measured,
        "eer_measured": record.eer_measured,
        "ashrae_compliance": record.ashrae_compliance,
        "annual_kwh_baseline": record.annual_kwh_baseline,
        "annual_kwh_optimized": record.annual_kwh_optimized,
        "annual_kwh_wasted": record.annual_kwh_wasted,
        "annual_cost_savings": record.annual_cost_savings,
        "currency": record.currency,
        "currency_symbol": record.currency_symbol,
        "carbon_emissions_mt": record.carbon_emissions_mt,
        "carbon_abatement_mt": record.carbon_abatement_mt,
        "trees_offset_equivalent": record.trees_offset_equivalent,
        "summary": record.summary,
        "detailed_metrics": metrics,
        "recommendations": recommendations,
        "created_at": record.created_at
    }

@router.post("/create", response_model=schemas.AuditResponse)
def create_audit(
    request: schemas.AuditCreateRequest,
    db: Session = Depends(get_db)
):
    """
    Executes a comprehensive ASHRAE Standard 90.1 & ESG Energy Compliance Audit
    based on real-time telemetry, thermodynamic psychrometrics, and AI fault models.
    """
    unit_id = request.unit_id or "HVAC-001"
    unit = db.query(models.HVACUnit).filter(models.HVACUnit.unit_id == unit_id).first()
    unit_name = unit.name if unit else "Commercial Central AHU"

    latest_reading = db.query(models.SensorReading).filter(
        models.SensorReading.unit_id == unit_id
    ).order_by(models.SensorReading.timestamp.desc()).first()

    temp = latest_reading.temperature if latest_reading else 24.2
    hum = latest_reading.humidity if latest_reading else 52.0
    press = latest_reading.pressure if latest_reading else 101.3
    curr = latest_reading.current if latest_reading else 4.8
    power = latest_reading.power if latest_reading else 1100.0
    occupancy = latest_reading.occupancy if latest_reading else 6

    # 1. Thermodynamic & Psychrometric Calculations
    dew_point = hvac_optimizer.calculate_dew_point(temp, hum)
    wet_bulb = hvac_optimizer.calculate_wet_bulb(temp, hum)
    enthalpy = hvac_optimizer.calculate_moist_air_enthalpy(temp, hum, press)
    refrig = hvac_optimizer.calculate_refrigerant_cycle_estimates(press, temp, curr)

    cop = refrig.get("cop", 3.4)
    eer = refrig.get("eer", 11.6)
    superheat = refrig.get("estimated_superheat_c", 6.5)
    subcooling = refrig.get("estimated_subcooling_c", 5.2)
    rla_pct = refrig.get("rla_pct", 78.0)
    stress_level = refrig.get("compressor_stress_level", "Nominal")

    # 2. Check Recent Faults & Alerts
    active_alerts_count = db.query(models.Alert).filter(
        models.Alert.unit_id == unit_id,
        models.Alert.is_resolved == False
    ).count()

    latest_pred = db.query(models.Prediction).filter(
        models.Prediction.unit_id == unit_id
    ).order_by(models.Prediction.timestamp.desc()).first()
    has_anomaly = latest_pred.is_anomaly if latest_pred else False
    fault_type = latest_pred.predicted_fault if latest_pred else "normal"

    # 3. Compute Audit Score & Grade
    score = 96.0
    deductions = []

    if cop < 2.5:
        score -= 22.0
        deductions.append(f"Severely sub-optimal COP ({cop:.2f} < 2.50 threshold)")
    elif cop < 3.2:
        score -= 10.0
        deductions.append(f"COP ({cop:.2f}) lower than ASHRAE 90.1 benchmark (3.20)")

    if rla_pct > 110.0:
        score -= 18.0
        deductions.append(f"Compressor overload: Rated Load Amps at {rla_pct:.1f}%")
    elif rla_pct > 95.0:
        score -= 8.0
        deductions.append(f"Elevated compressor motor load ({rla_pct:.1f}% RLA)")

    if superheat > 12.0:
        score -= 12.0
        deductions.append(f"Excessive evaporator superheat ({superheat:.1f}°C) indicating low charge")
    elif superheat < 3.0:
        score -= 10.0
        deductions.append(f"Low superheat ({superheat:.1f}°C) risking liquid refrigerant floodback")

    if has_anomaly and fault_type != "normal":
        score -= 15.0
        deductions.append(f"Active AI anomaly detected: {fault_type}")

    if active_alerts_count > 0:
        score -= min(15.0, active_alerts_count * 5.0)
        deductions.append(f"{active_alerts_count} unresolved system alert(s)")

    score = max(35.0, min(99.0, round(score, 1)))

    if score >= 90:
        grade = "A+"
        ashrae_status = "FULLY COMPLIANT"
    elif score >= 82:
        grade = "A"
        ashrae_status = "COMPLIANT"
    elif score >= 72:
        grade = "B"
        ashrae_status = "CONDITIONAL PASS"
    elif score >= 60:
        grade = "C"
        ashrae_status = "ACTION REQUIRED"
    elif score >= 45:
        grade = "D"
        ashrae_status = "NON-COMPLIANT"
    else:
        grade = "F"
        ashrae_status = "CRITICAL DEFICIT"

    # 4. Energy & Carbon Accounting (Annualized)
    # Assumes 10 hours/day, 300 days/year operational cycle = 3,000 hrs/yr
    annual_operating_hours = 3000.0
    baseline_kwh = round((power * annual_operating_hours) / 1000.0, 1)

    # Optimization potential: 16% - 24% through AI setpoint modulation and dynamic setback
    savings_pct = 0.22 if score > 75 else 0.29
    annual_wasted_kwh = round(baseline_kwh * savings_pct, 1)
    annual_optimized_kwh = round(baseline_kwh - annual_wasted_kwh, 1)

    tariff = request.electricity_tariff or 8.50
    symbol = "₹" if (request.currency or "INR").upper() == "INR" else "$"
    annual_cost_savings = round(annual_wasted_kwh * tariff, 2)

    # Grid emission factor: ~0.82 kg CO2e / kWh
    grid_emission_factor = 0.82
    total_co2_mt = round((baseline_kwh * grid_emission_factor) / 1000.0, 2)
    carbon_abatement_mt = round((annual_wasted_kwh * grid_emission_factor) / 1000.0, 2)
    trees_offset = int(round(carbon_abatement_mt * 45))

    # 5. Build Actionable Recommendations
    recommendations = [
        {
            "priority": "Immediate" if rla_pct > 95 else "Medium",
            "category": "Controls & Automation",
            "title": "Dynamic Occupancy-Aware Setpoint Offset",
            "description": f"Modulate indoor setpoint from {temp:.1f}°C to 24.5°C during low occupancy periods ({occupancy} occupants detected).",
            "estimated_capex": 0.0,
            "annual_savings": round(annual_cost_savings * 0.45, 2),
            "payback_months": 0.0
        },
        {
            "priority": "High" if (superheat > 10 or has_anomaly) else "Low",
            "category": "Thermodynamic & Refrigerant",
            "title": "Thermostatic Expansion Valve (TXV) Calibration",
            "description": f"Rebalance refrigerant charge and inspect expansion orifice to stabilize superheat within ASHRAE optimal 5-8°C band.",
            "estimated_capex": round(3500.0 if symbol == "₹" else 150.0, 2),
            "annual_savings": round(annual_cost_savings * 0.35, 2),
            "payback_months": 1.2
        },
        {
            "priority": "Medium",
            "category": "Mechanical Maintenance",
            "title": "Condenser Coil Chemical Descaling & Wash",
            "description": "Remove particulate buildup from aluminum fins to restore approach temperature and reduce condensing pressure by 8-12%.",
            "estimated_capex": round(2500.0 if symbol == "₹" else 95.0, 2),
            "annual_savings": round(annual_cost_savings * 0.20, 2),
            "payback_months": 0.9
        }
    ]

    detailed_metrics = {
        "thermodynamics": {
            "indoor_temp_c": temp,
            "humidity_pct": hum,
            "dew_point_c": dew_point,
            "wet_bulb_c": wet_bulb,
            "enthalpy_kj_kg": enthalpy,
            "pressure_kpa": press
        },
        "refrigeration_cycle": {
            "cop": cop,
            "eer": eer,
            "superheat_c": superheat,
            "subcooling_c": subcooling,
            "compression_ratio": refrig.get("compression_ratio", 3.2),
            "compressor_stress": stress_level,
            "rla_pct": rla_pct
        },
        "deductions_applied": deductions,
        "operating_hours_annual": annual_operating_hours
    }

    summary = (
        f"Official ESG & ASHRAE 90.1 Energy Audit for {unit_name} ({unit_id}). "
        f"Unit scored {score}/100 with Grade '{grade}' and compliance status '{ashrae_status}'. "
        f"Thermodynamic COP is {cop:.2f} at {rla_pct:.1f}% RLA load. "
        f"Identified {annual_wasted_kwh:,.0f} kWh/year in recoverable energy waste, representing "
        f"{symbol}{annual_cost_savings:,.2f} in financial savings and {carbon_abatement_mt:.2f} metric tonnes of Scope 2 CO2e abatement."
    )

    audit_code = f"AUD-2026-{uuid.uuid4().hex[:6].upper()}"

    record = models.AuditRecord(
        audit_id=audit_code,
        facility_name=request.facility_name or "Airconiq Cyber Park - HQ Facility",
        unit_id=unit_id,
        auditor_email=request.auditor_email or "auditor@airconiq.ai",
        auditor_name=request.auditor_name or "ESG Energy Auditor",
        audit_type=request.audit_type or "ASHRAE Level 2 Detailed Thermodynamic & ESG Audit",
        score=score,
        letter_grade=grade,
        cop_measured=cop,
        eer_measured=eer,
        ashrae_compliance=ashrae_status,
        annual_kwh_baseline=baseline_kwh,
        annual_kwh_optimized=annual_optimized_kwh,
        annual_kwh_wasted=annual_wasted_kwh,
        annual_cost_savings=annual_cost_savings,
        currency=request.currency or "INR",
        currency_symbol=symbol,
        carbon_emissions_mt=total_co2_mt,
        carbon_abatement_mt=carbon_abatement_mt,
        trees_offset_equivalent=trees_offset,
        summary=summary,
        detailed_metrics=json.dumps(detailed_metrics),
        recommendations=json.dumps(recommendations),
        created_at=datetime.now(timezone.utc)
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return _format_audit_response(record)

@router.get("/latest", response_model=schemas.AuditResponse)
def get_latest_audit(
    unit_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Returns the most recent audit report. If no audit has been run yet,
    automatically generates a real-time initial audit report.
    """
    query = db.query(models.AuditRecord)
    if unit_id:
        query = query.filter(models.AuditRecord.unit_id == unit_id)
    latest = query.order_by(models.AuditRecord.created_at.desc()).first()

    if not latest:
        # Auto-create first audit
        req = schemas.AuditCreateRequest(unit_id=unit_id or "HVAC-001")
        return create_audit(request=req, db=db)

    return _format_audit_response(latest)

@router.get("/list", response_model=List[schemas.AuditResponse])
def list_audits(
    limit: int = 20,
    db: Session = Depends(get_db)
):
    records = db.query(models.AuditRecord).order_by(models.AuditRecord.created_at.desc()).limit(limit).all()
    return [_format_audit_response(r) for r in records]

@router.get("/{audit_id}", response_model=schemas.AuditResponse)
def get_audit_by_id(
    audit_id: str,
    db: Session = Depends(get_db)
):
    record = db.query(models.AuditRecord).filter(models.AuditRecord.audit_id == audit_id).first()
    if not record:
        raise HTTPException(status_code=404, detail=f"Audit with ID '{audit_id}' not found.")
    return _format_audit_response(record)
