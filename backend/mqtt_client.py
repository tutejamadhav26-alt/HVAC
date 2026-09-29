"""
MQTT Subscriber Client
Subscribes to MQTT topic 'hvac/sensor/readings' for hardware (ESP32/sensors).
Processes payload through ML pipeline, stores in database, and notifies WebSockets.
Runs non-blockingly; if MQTT broker is unavailable, application continues uninterrupted.
"""

import os
import json
import threading
import datetime
from typing import Callable, Optional
import paho.mqtt.client as mqtt
from database import SessionLocal
import models
from ml_engine import ml_engine

MQTT_BROKER = os.getenv("MQTT_BROKER", "localhost")
MQTT_PORT = int(os.getenv("MQTT_PORT", 1883))
MQTT_TOPIC = os.getenv("MQTT_TOPIC", "hvac/sensor/readings")

class MQTTManager:
    def __init__(self):
        self.client = mqtt.Client(client_id="SmartHVAC_Backend")
        self.is_connected = False
        self.ws_broadcast_callback: Optional[Callable] = None
        self.client.on_connect = self._on_connect
        self.client.on_message = self._on_message
        self.client.on_disconnect = self._on_disconnect

    def set_broadcast_callback(self, callback: Callable):
        self.ws_broadcast_callback = callback

    def start(self):
        def _connect_thread():
            try:
                print(f"[+] Connecting to MQTT Broker at {MQTT_BROKER}:{MQTT_PORT}...")
                self.client.connect(MQTT_BROKER, MQTT_PORT, keepalive=60)
                self.client.loop_start()
            except Exception as e:
                print(f"[-] MQTT Broker connection unavailable ({e}). Simulator fallback active.")
                self.is_connected = False

        threading.Thread(target=_connect_thread, daemon=True).start()

    def stop(self):
        try:
            self.client.loop_stop()
            self.client.disconnect()
        except Exception:
            pass

    def _on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            self.is_connected = True
            print(f"[+] MQTT Connected successfully. Subscribing to topic '{MQTT_TOPIC}'")
            client.subscribe(MQTT_TOPIC)
        else:
            print(f"[-] MQTT Connection failed with result code {rc}")
            self.is_connected = False

    def _on_disconnect(self, client, userdata, rc):
        self.is_connected = False
        print("[-] MQTT Disconnected.")

    def _on_message(self, client, userdata, msg):
        try:
            payload_str = msg.payload.decode("utf-8")
            data = json.loads(payload_str)
            self._process_mqtt_sensor_data(data)
        except Exception as e:
            print(f"[-] Error processing MQTT message: {e}")

    def _process_mqtt_sensor_data(self, data: dict):
        unit_id = data.get("device_id") or data.get("unit_id") or "HVAC-001"
        temp = float(data.get("temperature", 24.0))
        hum = float(data.get("humidity", 50.0))
        press = float(data.get("pressure", 101.3))
        curr = float(data.get("current", 4.8))
        pow_w = float(data.get("power", curr * 220.0))

        db = SessionLocal()
        try:
            # Check/create HVAC Unit
            hvac_unit = db.query(models.HVACUnit).filter(models.HVACUnit.unit_id == unit_id).first()
            if not hvac_unit:
                hvac_unit = models.HVACUnit(
                    unit_id=unit_id,
                    name=f"ESP32 Unit ({unit_id})",
                    location="Hardware Sensor Location",
                    status="NORMAL"
                )
                db.add(hvac_unit)
                db.commit()

            # Store Sensor Reading
            reading = models.SensorReading(
                unit_id=unit_id,
                temperature=temp,
                humidity=hum,
                pressure=press,
                current=curr,
                power=pow_w,
                timestamp=datetime.datetime.utcnow()
            )
            db.add(reading)
            db.commit()
            db.refresh(reading)

            # Perform ML Inference
            pred_dict = ml_engine.predict(temp, hum, press, curr, pow_w)
            prediction = models.Prediction(
                reading_id=reading.id,
                unit_id=unit_id,
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

            if pred_dict["severity"] == "Critical":
                hvac_unit.status = "CRITICAL"
            elif pred_dict["severity"] in ["High", "Medium"]:
                hvac_unit.status = "WARNING"
            else:
                hvac_unit.status = "NORMAL"

            db.commit()

            res_dict = {
                "unit_id": unit_id,
                "source": "MQTT",
                "reading": {
                    "id": reading.id,
                    "temperature": temp,
                    "humidity": hum,
                    "pressure": press,
                    "current": curr,
                    "power": pow_w,
                    "timestamp": reading.timestamp.isoformat()
                },
                "prediction": pred_dict,
                "unit_status": hvac_unit.status
            }

            if self.ws_broadcast_callback:
                self.ws_broadcast_callback(res_dict)

        finally:
            db.close()

# Global Instance
mqtt_manager = MQTTManager()
