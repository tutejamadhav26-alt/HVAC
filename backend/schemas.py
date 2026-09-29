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
    status: str = "NORMAL"

class HVACUnitCreate(HVACUnitBase):
    pass

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
