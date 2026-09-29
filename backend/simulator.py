"""
HVAC Sensor Simulator Engine
Continuously generates realistic sensor telemetry according to selected scenarios
(NORMAL, FILTER_CLOGGING, COMPRESSOR_OVERLOAD, REFRIGERANT_LEAKAGE, RANDOM_FAULT)
and speed multipliers (1x, 2x, 5x, 10x).
Feeds data into ML pipeline, persists to DB, and notifies active WebSockets.
"""

import time
import math
import random
import threading
import datetime
from typing import Callable, Optional
from sqlalchemy.orm import Session
from database import SessionLocal
import models
from ml_engine import ml_engine

class HVACSimulator:
    def __init__(self):
        self.is_running = False
        self.scenario = "NORMAL" # NORMAL, FILTER_CLOGGING, COMPRESSOR_OVERLOAD, REFRIGERANT_LEAKAGE, RANDOM_FAULT
        self.speed_multiplier = 1.0
        self.unit_id = "HVAC-001"
        self.thread: Optional[threading.Thread] = None
        self.ws_broadcast_callback: Optional[Callable] = None
        self.step_counter = 0

        # State tracking for gradual evolving dynamics
        self.curr_temp = 23.0
        self.curr_hum = 50.0
        self.curr_press = 101.3
        self.curr_current = 4.8
        self.curr_power = 1050.0

    def start(self, scenario: str = "NORMAL", speed_multiplier: float = 1.0):
        self.scenario = scenario
        self.speed_multiplier = max(0.5, min(10.0, speed_multiplier))
        if not self.is_running:
            self.is_running = True
            self.thread = threading.Thread(target=self._run_loop, daemon=True)
            self.thread.start()
            print(f"[+] HVACSimulator started. Scenario: {self.scenario}, Speed: {self.speed_multiplier}x")

    def stop(self):
        self.is_running = False
        if self.thread:
            self.thread.join(timeout=2.0)
        print("[+] HVACSimulator stopped.")

    def set_scenario(self, scenario: str, speed_multiplier: Optional[float] = None):
        self.scenario = scenario
        if speed_multiplier:
            self.speed_multiplier = max(0.5, min(10.0, speed_multiplier))
        print(f"[+] Simulator updated -> Scenario: {self.scenario}, Speed: {self.speed_multiplier}x")

    def set_broadcast_callback(self, callback: Callable):
        self.ws_broadcast_callback = callback

    def _run_loop(self):
        while self.is_running:
            try:
                self.step_counter += 1
                self._update_physics_state()
                reading_data = self._process_step()

                if self.ws_broadcast_callback:
                    try:
                        self.ws_broadcast_callback(reading_data)
                    except Exception as ws_err:
                        print(f"[-] Simulator WS broadcast error: {ws_err}")

            except Exception as e:
                print(f"[-] Error in simulator loop: {e}")

            # Sleep interval scaled by speed multiplier (base 2 seconds)
            sleep_time = max(0.2, 2.0 / self.speed_multiplier)
            time.sleep(sleep_time)

    def _update_physics_state(self):
        active_scenario = self.scenario
        if active_scenario == "RANDOM_FAULT":
            faults = ["FILTER_CLOGGING", "COMPRESSOR_OVERLOAD", "REFRIGERANT_LEAKAGE"]
            active_scenario = faults[(self.step_counter // 15) % len(faults)]

        noise_t = random.uniform(-0.2, 0.2)
        noise_h = random.uniform(-0.5, 0.5)
        noise_p = random.uniform(-0.1, 0.1)
        noise_c = random.uniform(-0.05, 0.05)

        if active_scenario == "NORMAL":
            # Target values relax back to nominal bounds
            self.curr_temp += (23.0 + noise_t - self.curr_temp) * 0.15
            self.curr_hum += (50.0 + noise_h - self.curr_hum) * 0.15
            self.curr_press += (101.3 + noise_p - self.curr_press) * 0.15
            self.curr_current += (4.8 + noise_c - self.curr_current) * 0.15
            self.curr_power = self.curr_current * 220.0 + random.uniform(-10, 10)

        elif active_scenario == "FILTER_CLOGGING":
            # Gradual temperature & current rise, pressure drop
            self.curr_temp = min(35.0, self.curr_temp + 0.4 + noise_t)
            self.curr_hum = min(75.0, self.curr_hum + 0.6 + noise_h)
            self.curr_press = max(95.0, self.curr_press - 0.2 + noise_p)
            self.curr_current = min(9.0, self.curr_current + 0.15 + noise_c)
            self.curr_power = self.curr_current * 225.0 + random.uniform(-20, 20)

        elif active_scenario == "COMPRESSOR_OVERLOAD":
            # Current & power spike rapidly
            self.curr_temp = min(38.0, self.curr_temp + 0.6 + noise_t)
            self.curr_hum = max(30.0, self.curr_hum - 0.4 + noise_h)
            self.curr_press = min(108.0, self.curr_press + 0.3 + noise_p)
            self.curr_current = min(15.0, self.curr_current + 0.8 + noise_c)
            self.curr_power = self.curr_current * 230.0 + random.uniform(-50, 50)

        elif active_scenario == "REFRIGERANT_LEAKAGE":
            # Pressure drops sharply, temperature rises
            self.curr_temp = min(36.0, self.curr_temp + 0.5 + noise_t)
            self.curr_hum = max(25.0, self.curr_hum - 0.8 + noise_h)
            self.curr_press = max(70.0, self.curr_press - 1.5 + noise_p)
            self.curr_current = min(8.0, self.curr_current + 0.1 + noise_c)
            self.curr_power = self.curr_current * 215.0 + random.uniform(-15, 15)

    def _process_step(self) -> dict:
        db: Session = SessionLocal()
        try:
            # Ensure HVAC Unit exists in DB
            hvac_unit = db.query(models.HVACUnit).filter(models.HVACUnit.unit_id == self.unit_id).first()
            if not hvac_unit:
                hvac_unit = models.HVACUnit(
                    unit_id=self.unit_id,
                    name="Main Central Chiller Unit",
                    location="Building A - Mechanical Room 1",
                    status="NORMAL"
                )
                db.add(hvac_unit)
                db.commit()

            # 1. Create Sensor Reading
            reading = models.SensorReading(
                unit_id=self.unit_id,
                temperature=round(float(self.curr_temp), 2),
                humidity=round(float(self.curr_hum), 2),
                pressure=round(float(self.curr_press), 2),
                current=round(float(self.curr_current), 2),
                power=round(float(self.curr_power), 2),
                timestamp=datetime.datetime.utcnow()
            )
            db.add(reading)
            db.commit()
            db.refresh(reading)

            # 2. Run ML Prediction
            pred_dict = ml_engine.predict(
                reading.temperature,
                reading.humidity,
                reading.pressure,
                reading.current,
                reading.power
            )

            prediction = models.Prediction(
                reading_id=reading.id,
                unit_id=self.unit_id,
                anomaly_score=pred_dict["anomaly_score"],
                is_anomaly=pred_dict["is_anomaly"],
                predicted_fault=pred_dict["predicted_fault"],
                confidence=pred_dict["confidence"],
                severity=pred_dict["severity"],
                health_score=pred_dict["health_score"],
                recommended_action=pred_dict["recommended_action"],
                timestamp=datetime.datetime.utcnow()
            )
            db.add(prediction)

            # Update Unit Status
            if pred_dict["severity"] == "Critical":
                hvac_unit.status = "CRITICAL"
            elif pred_dict["severity"] in ["High", "Medium"]:
                hvac_unit.status = "WARNING"
            else:
                hvac_unit.status = "NORMAL"

            # 3. Alert Generation Logic
            alert_created = None
            if pred_dict["is_anomaly"] or pred_dict["severity"] in ["High", "Critical"]:
                # Check for recent unresolved alert to prevent duplicate flooding
                recent_alert = db.query(models.Alert).filter(
                    models.Alert.unit_id == self.unit_id,
                    models.Alert.is_resolved == False,
                    models.Alert.alert_type == pred_dict["predicted_fault"]
                ).first()

                if not recent_alert:
                    alert_severity = "critical" if pred_dict["severity"] == "Critical" else "warning"
                    title_map = {
                        "compressor_overload": "Compressor Overload Detected",
                        "filter_clogging": "Airflow Restriction / Filter Clogged",
                        "refrigerant_leakage": "Refrigerant Pressure Loss Detected"
                    }
                    alert = models.Alert(
                        unit_id=self.unit_id,
                        alert_type=pred_dict["predicted_fault"],
                        title=title_map.get(pred_dict["predicted_fault"], "HVAC Anomaly Alert"),
                        message=f"ML Anomaly Score {pred_dict['anomaly_score']} with {pred_dict['confidence']}% confidence. {pred_dict['recommended_action']}",
                        severity=alert_severity,
                        is_resolved=False,
                        timestamp=datetime.datetime.utcnow()
                    )
                    db.add(alert)
                    db.commit()
                    db.refresh(alert)
                    alert_created = {
                        "id": alert.id,
                        "title": alert.title,
                        "message": alert.message,
                        "severity": alert.severity,
                        "timestamp": alert.timestamp.isoformat()
                    }

            db.commit()

            return {
                "unit_id": self.unit_id,
                "reading": {
                    "id": reading.id,
                    "temperature": reading.temperature,
                    "humidity": reading.humidity,
                    "pressure": reading.pressure,
                    "current": reading.current,
                    "power": reading.power,
                    "timestamp": reading.timestamp.isoformat()
                },
                "prediction": {
                    "anomaly_score": pred_dict["anomaly_score"],
                    "is_anomaly": pred_dict["is_anomaly"],
                    "predicted_fault": pred_dict["predicted_fault"],
                    "confidence": pred_dict["confidence"],
                    "severity": pred_dict["severity"],
                    "health_score": pred_dict["health_score"],
                    "recommended_action": pred_dict["recommended_action"]
                },
                "unit_status": hvac_unit.status,
                "alert": alert_created,
                "scenario": self.scenario,
                "speed_multiplier": self.speed_multiplier
            }

        finally:
            db.close()

# Global simulator instance
simulator = HVACSimulator()
