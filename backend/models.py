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
    building_floor = Column(String, default="Floor 2")
    zone_type = Column(String, default="Commercial Office / Conference")
    brand = Column(String, default="Daikin")  # Daikin, Carrier, Panasonic, Toshiba, Mitsubishi, LG, Voltas
    current_setpoint = Column(Float, default=24.0)
    current_mode = Column(String, default="AUTO")
    fan_speed = Column(String, default="AUTO")
    power_state = Column(Boolean, default=True)
    status = Column(String, default="NORMAL")  # NORMAL, WARNING, CRITICAL, OFFLINE
    controller_type = Column(String, default="simulator")  # central_ducted, vrf_vrv, simulator, mqtt_esp32
    connection_params = Column(Text, default="{}")  # JSON encoded config
    connection_status = Column(String, default="SIMULATED")  # SIMULATED, CONNECTED, DISCONNECTED, UNCONFIGURED
    auto_mode_enabled = Column(Boolean, default=False)
    last_command_result = Column(Text, nullable=True)
    last_command_at = Column(DateTime, nullable=True)
    installation_date = Column(DateTime, default=utc_now)

    readings = relationship("SensorReading", back_populates="unit")
    predictions = relationship("Prediction", back_populates="unit")
    alerts = relationship("Alert", back_populates="unit")
    command_logs = relationship("HVACCommandLog", back_populates="unit")

class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(String, ForeignKey("hvac_units.unit_id"), index=True, nullable=False)
    temperature = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    pressure = Column(Float, nullable=False)
    current = Column(Float, nullable=False)
    power = Column(Float, nullable=False)
    occupancy = Column(Integer, default=0, nullable=False)     # Number of detected occupants
    outdoor_temp = Column(Float, default=32.0, nullable=False)  # Ambient outdoor temperature in °C
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

    # Intelligent Universal Remote Control Recommendations
    recommended_mode = Column(String, default="AUTO")    # COOL, DRY, AUTO, FAN, TURBO, ECO
    target_temperature = Column(Float, default=24.0)     # Recommended setpoint (°C)
    fan_speed = Column(String, default="AUTO")           # LOW, MED, HIGH, AUTO
    energy_saving_pct = Column(Float, default=15.0)      # % power savings predicted
    comfort_index = Column(Float, default=92.0)          # Thermal comfort index 0-100
    dew_point = Column(Float, default=13.5)              # Psychrometric dew point (°C)
    cop_estimate = Column(Float, default=3.4)            # Coefficient of performance
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

class AuditRecord(Base):
    __tablename__ = "audit_records"

    id = Column(Integer, primary_key=True, index=True)
    audit_id = Column(String, unique=True, index=True, nullable=False)
    facility_name = Column(String, default="Airconiq Cyber Park - Commercial Facility")
    unit_id = Column(String, nullable=False)
    auditor_email = Column(String, nullable=False)
    auditor_name = Column(String, default="ESG Energy Auditor")
    audit_type = Column(String, default="ASHRAE Level 2 Detailed Energy & Health Audit")
    score = Column(Float, nullable=False) # 0-100
    letter_grade = Column(String, nullable=False) # A+, A, B, C, D, F
    cop_measured = Column(Float, default=3.4)
    eer_measured = Column(Float, default=11.6)
    ashrae_compliance = Column(String, default="COMPLIANT")
    annual_kwh_baseline = Column(Float, default=24000.0)
    annual_kwh_optimized = Column(Float, default=18720.0)
    annual_kwh_wasted = Column(Float, default=5280.0)
    annual_cost_savings = Column(Float, default=44880.0)
    currency = Column(String, default="INR")
    currency_symbol = Column(String, default="₹")
    carbon_emissions_mt = Column(Float, default=19.68)
    carbon_abatement_mt = Column(Float, default=4.33)
    trees_offset_equivalent = Column(Integer, default=198)
    summary = Column(Text, nullable=False)
    detailed_metrics = Column(Text, nullable=True) # JSON serialized details
    created_at = Column(DateTime, default=utc_now, index=True)


class HVACCommandLog(Base):
    __tablename__ = "hvac_command_logs"

    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(String, ForeignKey("hvac_units.unit_id"), index=True, nullable=False)
    triggered_by = Column(String, default="manual")  # 'manual', 'ai_auto', 'schedule'
    user_email = Column(String, nullable=True)
    target_temperature = Column(Float, nullable=True)
    mode = Column(String, nullable=True)
    fan_speed = Column(String, nullable=True)
    power_state = Column(Boolean, nullable=True)
    success = Column(Boolean, default=True)
    message = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=utc_now, index=True)

    unit = relationship("HVACUnit", back_populates="command_logs")

