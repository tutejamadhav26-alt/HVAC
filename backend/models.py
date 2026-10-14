import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

def utc_now():
    return datetime.datetime.now(datetime.timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(String, default="staff")  # 'admin' or 'staff'
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)

class HVACUnit(Base):
    __tablename__ = "hvac_units"

    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(String, unique=True, index=True, nullable=False)  # e.g., 'HVAC-001'
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    status = Column(String, default="NORMAL")  # NORMAL, WARNING, CRITICAL, OFFLINE
    installation_date = Column(DateTime, default=utc_now)

    readings = relationship("SensorReading", back_populates="unit")
    predictions = relationship("Prediction", back_populates="unit")
    alerts = relationship("Alert", back_populates="unit")

class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(String, ForeignKey("hvac_units.unit_id"), index=True, nullable=False)
    temperature = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    pressure = Column(Float, nullable=False)
    current = Column(Float, nullable=False)
    power = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=utc_now, index=True)

    unit = relationship("HVACUnit", back_populates="readings")
    prediction = relationship("Prediction", back_populates="reading", uselist=False)

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    reading_id = Column(Integer, ForeignKey("sensor_readings.id"), nullable=True)
    unit_id = Column(String, ForeignKey("hvac_units.unit_id"), index=True, nullable=False)
    anomaly_score = Column(Float, nullable=False)
    is_anomaly = Column(Boolean, nullable=False)
    predicted_fault = Column(String, nullable=False)  # normal, filter_clogging, compressor_overload, refrigerant_leakage
    confidence = Column(Float, nullable=False)        # 0.0 - 1.0 (or percentage)
    severity = Column(String, nullable=False)          # Low, Medium, High, Critical
    health_score = Column(Float, nullable=False)      # 0 - 100
    recommended_action = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=utc_now, index=True)

    unit = relationship("HVACUnit", back_populates="predictions")
    reading = relationship("SensorReading", back_populates="prediction")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(String, ForeignKey("hvac_units.unit_id"), index=True, nullable=False)
    alert_type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String, nullable=False) # info, warning, critical
    is_resolved = Column(Boolean, default=False, index=True)
    resolved_at = Column(DateTime, nullable=True)
    resolved_by = Column(String, nullable=True)
    timestamp = Column(DateTime, default=utc_now, index=True)

    unit = relationship("HVACUnit", back_populates="alerts")

class SimulationEvent(Base):
    __tablename__ = "simulation_events"

    id = Column(Integer, primary_key=True, index=True)
    scenario = Column(String, nullable=False) # NORMAL, FILTER_CLOGGING, COMPRESSOR_OVERLOAD, REFRIGERANT_LEAKAGE, RANDOM_FAULT
    speed_multiplier = Column(Float, default=1.0)
    is_active = Column(Boolean, default=True)
    started_at = Column(DateTime, default=utc_now)
    stopped_at = Column(DateTime, nullable=True)

class SystemSettings(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    setting_key = Column(String, unique=True, index=True, nullable=False)
    setting_value = Column(Text, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

class EnergyRecord(Base):
    __tablename__ = "energy_records"

    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(String, ForeignKey("hvac_units.unit_id"), index=True, nullable=False)
    record_date = Column(String, nullable=False) # YYYY-MM-DD
    total_kwh = Column(Float, default=0.0)
    peak_power_w = Column(Float, default=0.0)
    avg_power_w = Column(Float, default=0.0)
    timestamp = Column(DateTime, default=utc_now)
