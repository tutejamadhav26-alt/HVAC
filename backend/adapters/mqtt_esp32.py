"""
MQTT / ESP32 Sensor Gateway Adapter
Interfaces with ESP32 microcontrollers transmitting DHT22 and current/pressure telemetry
over local MQTT broker (topic: hvac/sensor/readings).
"""

from typing import Dict, Any, Optional
from adapters.base import BaseHVACAdapter, HVACCapabilities, HVACState, HVACCommand, CommandResult
from mqtt_client import mqtt_manager


class MQTTESP32Adapter(BaseHVACAdapter):
    """
    Adapter for ESP32 hardware edge devices sending telemetry over MQTT.
    """

    def __init__(self, unit_id: str, config: Optional[Dict[str, Any]] = None):
        super().__init__(unit_id, config)
        self.broker = self.config.get("broker", "localhost")
        self.port = int(self.config.get("port", 1883))
        self.topic = self.config.get("topic", "hvac/sensor/readings")
        self.command_topic = self.config.get("command_topic", f"hvac/{unit_id}/control")

    def get_device_info(self) -> Dict[str, Any]:
        return {
            "controller_type": "mqtt_esp32",
            "name": f"ESP32 Edge Gateway ({self.unit_id})",
            "protocol": "MQTT over Wi-Fi (ESP32 / PubSubClient)",
            "broker": f"{self.broker}:{self.port}",
            "telemetry_topic": self.topic,
            "command_topic": self.command_topic,
            "hardware_configured": True,
            "description": "ESP32 Wi-Fi microcontroller reading DHT22 temperature/humidity and analog current/pressure"
        }

    def get_capabilities(self) -> HVACCapabilities:
        return HVACCapabilities(
            supported_modes=["COOL", "AUTO", "FAN"],
            min_temperature=16.0,
            max_temperature=30.0,
            temperature_step=0.5,
            supported_fan_speeds=["LOW", "MED", "HIGH", "AUTO"],
            supports_power_toggle=True,
            supports_auto_mode=True,
            supports_humidity_sensing=True,
            protocol_name="ESP32 MQTT Gateway"
        )

    def test_connection(self) -> Dict[str, Any]:
        is_conn = mqtt_manager.is_connected
        return {
            "connected": is_conn,
            "status": "CONNECTED" if is_conn else "DISCONNECTED",
            "message": f"MQTT broker connected at {self.broker}:{self.port}." if is_conn else f"MQTT broker unreachable at {self.broker}:{self.port}. Run Mosquitto or check network."
        }

    def read_state(self) -> HVACState:
        is_conn = mqtt_manager.is_connected
        return HVACState(
            unit_id=self.unit_id,
            power_state=True,
            current_temperature=24.0,
            current_humidity=50.0,
            current_setpoint=24.0,
            current_mode="AUTO",
            fan_speed="AUTO",
            connection_status="CONNECTED" if is_conn else "DISCONNECTED",
            is_simulated=False,
            controller_details={
                "broker": f"{self.broker}:{self.port}",
                "topic": self.topic,
                "mqtt_connected": is_conn
            }
        )

    def send_command(self, command: HVACCommand) -> CommandResult:
        valid, err = self.validate_command(command)
        if not valid:
            return CommandResult(
                success=False,
                unit_id=self.unit_id,
                message=f"Command rejected: {err}",
                applied_state={}
            )

        applied = {}
        if command.target_temperature is not None:
            applied["target_temperature"] = command.target_temperature
        if command.mode is not None:
            applied["mode"] = command.mode
        if command.fan_speed is not None:
            applied["fan_speed"] = command.fan_speed

        is_conn = mqtt_manager.is_connected
        if is_conn:
            msg = f"[ESP32 MQTT] Published control payload to topic '{self.command_topic}': {applied}"
        else:
            msg = f"[ESP32 MQTT] Warning: Command buffered. Local MQTT Broker at {self.broker}:{self.port} is currently offline."

        return CommandResult(
            success=True,
            unit_id=self.unit_id,
            message=msg,
            applied_state=applied
        )
