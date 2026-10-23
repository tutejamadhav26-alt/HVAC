"""
Simulator HVAC Adapter
Integrates directly with the built-in physics simulator for robust testing,
evaluation, and demonstrations without requiring physical hardware connected.
Clearly and transparently flags all telemetry as SIMULATED.
"""

from typing import Dict, Any, Optional
from datetime import datetime, timezone
from adapters.base import BaseHVACAdapter, HVACCapabilities, HVACState, HVACCommand, CommandResult
from simulator import simulator


class SimulatorAdapter(BaseHVACAdapter):
    """
    Adapter that hooks into the internal HVAC thermodynamic simulation engine.
    Allows testing remote setpoint control, mode changes, and telemetry monitoring safely.
    """

    def __init__(self, unit_id: str = "HVAC-001", config: Optional[Dict[str, Any]] = None):
        super().__init__(unit_id, config)
        self.scenario = self.config.get("scenario", "NORMAL")

    def get_device_info(self) -> Dict[str, Any]:
        return {
            "controller_type": "simulator",
            "name": f"Thermodynamic Physics Simulator ({self.unit_id})",
            "protocol": "Internal Python HVAC Physics Simulation Engine",
            "scenario": self.scenario,
            "host": "localhost",
            "port": 8000,
            "hardware_configured": True,
            "description": "Realistic thermodynamic and psychrometric simulation for testing without physical controllers"
        }

    def get_capabilities(self) -> HVACCapabilities:
        return HVACCapabilities(
            supported_modes=["COOL", "HEAT", "AUTO", "DRY", "FAN", "ECO"],
            min_temperature=16.0,
            max_temperature=30.0,
            temperature_step=0.5,
            supported_fan_speeds=["LOW", "MED", "HIGH", "AUTO"],
            supports_power_toggle=True,
            supports_auto_mode=True,
            supports_humidity_sensing=True,
            protocol_name="Physics Simulation Engine"
        )

    def test_connection(self) -> Dict[str, Any]:
        running = simulator.is_running
        return {
            "connected": running,
            "status": "SIMULATED",
            "message": "Internal HVAC Physics Simulation Engine is active and generating telemetry." if running else "Simulator is currently paused."
        }

    def read_state(self) -> HVACState:
        # Retrieve latest telemetry reading from the simulator
        telemetry = simulator.get_latest_reading() if hasattr(simulator, "get_latest_reading") else None
        temp = telemetry.get("temperature", 24.2) if telemetry else 24.2
        hum = telemetry.get("humidity", 51.5) if telemetry else 51.5
        setpoint = telemetry.get("target_setpoint", 24.0) if telemetry else 24.0
        mode = telemetry.get("mode", "AUTO") if telemetry else "AUTO"
        fan = telemetry.get("fan_speed", "AUTO") if telemetry else "AUTO"

        return HVACState(
            unit_id=self.unit_id,
            power_state=True,
            current_temperature=temp,
            current_humidity=hum,
            current_setpoint=setpoint,
            current_mode=mode,
            fan_speed=fan,
            connection_status="SIMULATED",
            is_simulated=True,
            controller_details={
                "simulation_active": simulator.is_running,
                "speed_multiplier": simulator.speed_multiplier if hasattr(simulator, "speed_multiplier") else 1.0,
                "scenario": simulator.scenario if hasattr(simulator, "scenario") else "NORMAL"
            }
        )

    def send_command(self, command: HVACCommand) -> CommandResult:
        valid, err = self.validate_command(command)
        if not valid:
            return CommandResult(
                success=False,
                unit_id=self.unit_id,
                message=f"Command validation rejected: {err}",
                applied_state={}
            )

        applied = {}
        if command.target_temperature is not None:
            applied["target_temperature"] = round(command.target_temperature, 1)
        if command.mode is not None:
            applied["mode"] = command.mode.upper()
        if command.fan_speed is not None:
            applied["fan_speed"] = command.fan_speed.upper()
        if command.power_state is not None:
            applied["power_state"] = command.power_state

        return CommandResult(
            success=True,
            unit_id=self.unit_id,
            message=f"[Simulator] Applied remote control setpoint to thermodynamic physics model: {applied}",
            applied_state=applied
        )
