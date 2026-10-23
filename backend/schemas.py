from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user_role: str
    full_name: Optional[str] = None

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: str = "staff"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# HVAC Unit Schemas
class HVACUnitBase(BaseModel):
    unit_id: str
    name: str
    location: str
    building_floor: Optional[str] = "Floor 2"
    zone_type: Optional[str] = "Commercial Office / Conference"
    brand: Optional[str] = "Daikin"
    current_setpoint: Optional[float] = 24.0
    current_mode: Optional[str] = "AUTO"
    fan_speed: Optional[str] = "AUTO"
    power_state: Optional[bool] = True
    status: str = "NORMAL"
    controller_type: Optional[str] = "simulator"  # central_ducted, vrf_vrv, simulator, mqtt_esp32
    connection_params: Optional[str] = "{}"
    connection_status: Optional[str] = "SIMULATED"
    auto_mode_enabled: Optional[bool] = False
    last_command_result: Optional[str] = None
    last_command_at: Optional[datetime] = None

class HVACUnitCreate(HVACUnitBase):
    pass

class HVACUnitUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    building_floor: Optional[str] = None
    zone_type: Optional[str] = None
    brand: Optional[str] = None
    controller_type: Optional[str] = None
    connection_params: Optional[str] = None
    auto_mode_enabled: Optional[bool] = None

class HVACUnitResponse(HVACUnitBase):
    id: int
    installation_date: datetime

    class Config:
        from_attributes = True

# Sensor Reading Schemas
class SensorReadingBase(BaseModel):
    unit_id: str
    temperature: float
    humidity: float
    pressure: float
    current: float
    power: float
    occupancy: Optional[int] = 0
    outdoor_temp: Optional[float] = 32.0
    timestamp: Optional[datetime] = None

class SensorReadingCreate(SensorReadingBase):
    pass

class SensorReadingResponse(SensorReadingBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

# Prediction Schemas
class PredictionResponse(BaseModel):
    id: int
    unit_id: str
    reading_id: Optional[int] = None
    anomaly_score: float
    is_anomaly: bool
    predicted_fault: str
    confidence: float
    severity: str
    health_score: float
    recommended_action: str
    recommended_mode: Optional[str] = "AUTO"
    target_temperature: Optional[float] = 24.0
    fan_speed: Optional[str] = "AUTO"
    energy_saving_pct: Optional[float] = 15.0
    comfort_index: Optional[float] = 92.0
    dew_point: Optional[float] = 13.5
    cop_estimate: Optional[float] = 3.4
    timestamp: datetime

    class Config:
        from_attributes = True

# Alert Schemas
class AlertResponse(BaseModel):
    id: int
    unit_id: str
    alert_type: str
    title: str
    message: str
    severity: str
    is_resolved: bool
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class AlertResolveRequest(BaseModel):
    resolved_by: Optional[str] = "Staff"

# Simulation Control Schemas
class SimulationConfig(BaseModel):
    scenario: str # NORMAL, FILTER_CLOGGING, COMPRESSOR_OVERLOAD, REFRIGERANT_LEAKAGE, RANDOM_FAULT
    speed_multiplier: Optional[float] = 1.0

class SimulationStatusResponse(BaseModel):
    is_running: bool
    scenario: str
    speed_multiplier: float
    started_at: Optional[datetime] = None

# Energy Analytics Schemas
class EnergySummaryResponse(BaseModel):
    unit_id: str
    current_power_w: float
    energy_today_kwh: float
    energy_week_kwh: float
    avg_power_w: float
    peak_power_w: float
    recommendation: str

# System Status Schemas
class SystemStatusResponse(BaseModel):
    status: str
    backend_version: str
    db_connected: bool
    ml_models_loaded: bool
    simulator_active: bool
    mqtt_connected: bool
    active_hvac_units: int
    total_readings: int
    active_alerts: int

# Universal Remote Recommendation Schemas
class UniversalRemoteRecommendation(BaseModel):
    unit_id: str
    brand: str
    current_temp: float
    current_humidity: float
    occupancy: int
    outdoor_temp: float
    recommended_mode: str         # COOL, DRY, AUTO, FAN, TURBO, ECO
    target_temperature: float    # Recommended setpoint (°C)
    fan_speed: str                # LOW, MED, HIGH, AUTO
    energy_saving_pct: float     # Estimated % power savings
    thermal_comfort_status: str  # Optimal, Overcooled, Warm, Humid, Empty Room
    rationale: str
    brand_command: dict          # Standard hex / payload for Daikin/Carrier/Panasonic etc.

class RemoteCommandApplyRequest(BaseModel):
    unit_id: str
    mode: str
    temperature: float
    fan_speed: Optional[str] = "AUTO"

# Technician Conceptual Diagnostics Schemas
class TechnicianDiagnosticsResponse(BaseModel):
    unit_id: str
    timestamp: datetime
    # Thermodynamic Psychrometric Metrics
    temperature_c: float
    humidity_pct: float
    pressure_kpa: float
    dew_point_c: float
    wet_bulb_c: float
    enthalpy_kj_kg: float
    # Refrigeration Cycle Estimations
    estimated_superheat_c: float
    estimated_subcooling_c: float
    compression_ratio: float
    cop: float                   # Coefficient of Performance
    eer: float                   # Energy Efficiency Ratio (BTU/Wh)
    # Electrical Diagnostics
    current_a: float
    power_w: float
    rla_pct: float               # Percentage of Rated Load Amps (RLA)
    compressor_stress_level: str # Nominal, Elevated, Critical
    technician_summary: str

# Commercial B2B ROI & Sustainability Schemas
class ROIAnalyticsResponse(BaseModel):
    unit_id: str
    daily_energy_kwh: float
    daily_cost_unoptimized: float
    daily_cost_optimized: float
    daily_savings: float
    monthly_savings_projection: float
    co2_saved_kg_monthly: float
    currency_symbol: str
    roi_payback_months: float
    occupancy_driven_savings_pct: float
    building_zones_optimized: int

# Comprehensive HVAC & ESG Audit Schemas
class AuditCreateRequest(BaseModel):
    unit_id: Optional[str] = "HVAC-001"
    facility_name: Optional[str] = "Airconiq Cyber Park - HQ Facility"
    auditor_email: Optional[str] = "auditor@airconiq.ai"
    auditor_name: Optional[str] = "ESG Energy Auditor"
    audit_type: Optional[str] = "ASHRAE Level 2 Detailed Thermodynamic & ESG Audit"
    electricity_tariff: Optional[float] = 8.50
    currency: Optional[str] = "INR"

class AuditRecommendationItem(BaseModel):
    priority: str       # Immediate, High, Medium, Low
    category: str       # Mechanical, Thermodynamic, Controls, Maintenance
    title: str
    description: str
    estimated_capex: float
    annual_savings: float
    payback_months: float

class AuditResponse(BaseModel):
    id: int
    audit_id: str
    facility_name: str
    unit_id: str
    auditor_email: str
    auditor_name: str
    audit_type: str
    score: float
    letter_grade: str
    cop_measured: float
    eer_measured: float
    ashrae_compliance: str
    annual_kwh_baseline: float
    annual_kwh_optimized: float
    annual_kwh_wasted: float
    annual_cost_savings: float
    currency: str
    currency_symbol: str
    carbon_emissions_mt: float
    carbon_abatement_mt: float
    trees_offset_equivalent: int
    summary: str
    detailed_metrics: Optional[dict] = None
    recommendations: Optional[List[dict]] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Remote Control, Controller Adapter, and Unified AI Recommendation Schemas
class HVACRemoteCommandRequest(BaseModel):
    unit_id: str
    power_state: Optional[bool] = None
    target_temperature: Optional[float] = None
    mode: Optional[str] = None
    fan_speed: Optional[str] = None
    triggered_by: Optional[str] = "manual"  # 'manual', 'ai_auto'


class HVACRemoteCommandResponse(BaseModel):
    success: bool
    unit_id: str
    message: str
    applied_state: dict
    timestamp: str


class DeviceCapabilitiesResponse(BaseModel):
    unit_id: str
    controller_type: str
    supported_modes: List[str]
    min_temperature: float
    max_temperature: float
    temperature_step: float
    supported_fan_speeds: List[str]
    supports_power_toggle: bool
    supports_auto_mode: bool
    protocol_name: str


class ConnectionTestResult(BaseModel):
    connected: bool
    status: str
    message: str


class UnifiedAIRecommendation(BaseModel):
    unit_id: str
    current_conditions: dict
    ml_model_diagnosis: dict
    setpoint_recommendation: dict
    strategy_distinction: dict
    auto_mode_status: dict
    timestamp: str

