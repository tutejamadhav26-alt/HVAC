"""
Backend ML Inference Engine
Loads trained models from backend/models/ and performs real-time inference
on incoming sensor readings. Dynamically calculates HVAC Health Score (0-100)
and yields recommended maintenance actions.
"""

import os
import json
import joblib
import numpy as np
try:
    import pandas as pd
except ImportError:
    pd = None

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")

class MLEngine:
    def __init__(self):
        self.scaler = None
        self.label_encoder = None
        self.iso_forest = None
        self.fault_classifier = None
        self.power_forecaster = None
        self.models_loaded = False
        self.load_models()

    def load_models(self):
        try:
            scaler_path = os.path.join(MODEL_DIR, "scaler.joblib")
            le_path = os.path.join(MODEL_DIR, "label_encoder.joblib")
            iso_path = os.path.join(MODEL_DIR, "isolation_forest.joblib")
            fault_path = os.path.join(MODEL_DIR, "fault_classifier.joblib")
            forecaster_path = os.path.join(MODEL_DIR, "power_forecaster.joblib")

            if all(os.path.exists(p) for p in [scaler_path, le_path, iso_path, fault_path]):
                self.scaler = joblib.load(scaler_path)
                self.label_encoder = joblib.load(le_path)
                self.iso_forest = joblib.load(iso_path)
                self.fault_classifier = joblib.load(fault_path)
                if os.path.exists(forecaster_path):
                    self.power_forecaster = joblib.load(forecaster_path)
                self.models_loaded = True
                print("[+] MLEngine: All ML models loaded successfully.")
            else:
                print("[-] MLEngine: Trained model files not found in backend/models/. Using physics fallback mode.")
                self.models_loaded = False
        except Exception as e:
            print(f"[-] MLEngine: Error loading models: {e}. Falling back to rule-based engine.")
            self.models_loaded = False

    def predict(self, temperature: float, humidity: float, pressure: float, current: float, power: float) -> dict:
        features = np.array([[temperature, humidity, pressure, current, power]])
        
        if self.models_loaded:
            try:
                # 1. Anomaly Detection
                features_scaled = self.scaler.transform(features)
                iso_res = self.iso_forest.predict(features_scaled)[0]
                # anomaly_score range: negative indicates anomaly, positive indicates normal
                decision_func = float(self.iso_forest.decision_function(features_scaled)[0])
                # Normalize decision function to anomaly score (0.0 normal -> 1.0 extreme anomaly)
                anomaly_score = max(0.0, min(1.0, float(0.5 - decision_func)))
                is_anomaly = bool(iso_res == -1 or anomaly_score > 0.45)

                # 2. Fault Classification
                fault_pred_idx = self.fault_classifier.predict(features)[0]
                fault_probs = self.fault_classifier.predict_proba(features)[0]
                predicted_fault = str(self.label_encoder.inverse_transform([fault_pred_idx])[0])
                confidence = float(np.max(fault_probs))

            except Exception as err:
                print(f"[-] ML Inference error: {err}. Using physics fallback.")
                return self._physics_fallback_predict(temperature, humidity, pressure, current, power)
        else:
            return self._physics_fallback_predict(temperature, humidity, pressure, current, power)

        # Determine Severity & Recommended Action
        severity, action = self._determine_severity_and_action(predicted_fault, confidence, anomaly_score, temperature, current, pressure)

        # 3. Dynamic Health Score Calculation (0 - 100)
        health_score = self._calculate_health_score(predicted_fault, confidence, anomaly_score, temperature, current, pressure)

        return {
            "anomaly_score": round(anomaly_score, 4),
            "is_anomaly": is_anomaly,
            "predicted_fault": predicted_fault,
            "confidence": round(confidence * 100, 2), # percentage 0-100
            "severity": severity,
            "health_score": round(health_score, 1),
            "recommended_action": action
        }

    def _physics_fallback_predict(self, temp: float, hum: float, press: float, curr: float, pow_w: float) -> dict:
        predicted_fault = "normal"
        confidence = 0.95
        anomaly_score = 0.05
        is_anomaly = False

        if curr > 9.5 or pow_w > 2200:
            predicted_fault = "compressor_overload"
            confidence = min(0.99, 0.70 + (curr - 9.5) * 0.05)
            anomaly_score = 0.85
            is_anomaly = True
        elif press < 90.0:
            predicted_fault = "refrigerant_leakage"
            confidence = min(0.98, 0.75 + (90.0 - press) * 0.02)
            anomaly_score = 0.78
            is_anomaly = True
        elif temp > 27.0 or curr > 6.5:
            predicted_fault = "filter_clogging"
            confidence = min(0.95, 0.65 + (temp - 27.0) * 0.04)
            anomaly_score = 0.60
            is_anomaly = True

        severity, action = self._determine_severity_and_action(predicted_fault, confidence, anomaly_score, temp, curr, press)
        health_score = self._calculate_health_score(predicted_fault, confidence, anomaly_score, temp, curr, press)

        return {
            "anomaly_score": round(anomaly_score, 4),
            "is_anomaly": is_anomaly,
            "predicted_fault": predicted_fault,
            "confidence": round(confidence * 100, 2),
            "severity": severity,
            "health_score": round(health_score, 1),
            "recommended_action": action
        }

    def _determine_severity_and_action(self, fault: str, confidence: float, anomaly_score: float, temp: float, curr: float, press: float):
        if fault == "normal" and not (anomaly_score > 0.5):
            return "Low", "System operating normally. Perform standard routine inspection."

        if fault == "compressor_overload":
            if curr > 10.0 or confidence > 0.85:
                return "Critical", "Emergency: Shut down compressor immediately. Inspect motor electrical windings and thermal overload relay."
            return "High", "Warning: High compressor current detected. Check capacitor, voltage supply, and refrigerant subcooling."

        elif fault == "refrigerant_leakage":
            if press < 80.0 or confidence > 0.85:
                return "Critical", "Critical pressure loss detected! Turn off unit, locate refrigerant leak using sniffer, and recharge refrigerant."
            return "High", "Low suction pressure detected. Inspect expansion valve and evaporator coil for ice buildup."

        elif fault == "filter_clogging":
            if temp > 30.0 or curr > 7.5:
                return "High", "Significant airflow restriction! Replace air filter immediately and clean blower fan assembly."
            return "Medium", "Airflow restriction detected. Schedule filter replacement within 24 hours."

        return "Medium", "Anomalous operating conditions detected. Inspect sensors and check overall system calibration."

    def _calculate_health_score(self, fault: str, confidence: float, anomaly_score: float, temp: float, curr: float, press: float) -> float:
        if fault == "normal":
            # Baseline 92 - 100
            score = 100.0 - (anomaly_score * 20.0) - max(0.0, (temp - 24.0) * 1.5)
            return max(85.0, min(100.0, score))

        penalty = 0.0
        if fault == "compressor_overload":
            penalty = 45.0 + (confidence * 30.0) + (curr - 5.0) * 3.0
        elif fault == "refrigerant_leakage":
            penalty = 40.0 + (confidence * 25.0) + (101.3 - press) * 0.8
        elif fault == "filter_clogging":
            penalty = 20.0 + (confidence * 20.0) + (temp - 23.0) * 2.0
        else:
            penalty = 30.0 + (anomaly_score * 40.0)

        health = 100.0 - penalty
        return max(5.0, min(84.0, health))

# Global instance
ml_engine = MLEngine()
