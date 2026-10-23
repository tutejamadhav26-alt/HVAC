"""
Base HVAC Controller Adapter Specification & Shared Interface
Defines the standard contract for all HVAC controller adapters:
- Central/Ducted HVAC (BACnet/IP, Modbus TCP, REST API)
- VRF/VRV Air Conditioning Systems (Daikin, Mitsubishi, Carrier, LG, CoolMasterNet)
- Simulator Fallback Adapter
- MQTT / IoT Sensor Gateway
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional, Tuple
from pydantic import BaseModel, Field
from datetime import datetime, timezone


class HVACCapabilities(BaseModel):
    supported_modes: List[str] = Field(default=["COOL", "HEAT", "AUTO", "FAN", "DRY"])
    min_temperature: float = Field(default=16.0, description="Minimum allowable setpoint in °C")
    max_temperature: float = Field(default=30.0, description="Maximum allowable setpoint in °C")
    temperature_step: float = Field(default=0.5, description="Setpoint adjustment step in °C")
    supported_fan_speeds: List[str] = Field(default=["LOW", "MED", "HIGH", "AUTO"])
    supports_power_toggle: bool = True
    supports_auto_mode: bool = True
    supports_humidity_sensing: bool = True
    protocol_name: str = "Generic HVAC Controller"


class HVACState(BaseModel):
    unit_id: str
    power_state: bool = True
    current_temperature: float = 24.0
    current_humidity: Optional[float] = 50.0
    current_setpoint: float = 24.0
    current_mode: str = "AUTO"
    fan_speed: str = "AUTO"
    connection_status: str = "SIMULATED"  # SIMULATED, CONNECTED, DISCONNECTED, UNCONFIGURED
    is_simulated: bool = True
    last_updated: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    controller_details: Dict[str, Any] = Field(default_factory=dict)


class HVACCommand(BaseModel):
    power_state: Optional[bool] = None
    target_temperature: Optional[float] = None
    mode: Optional[str] = None
    fan_speed: Optional[str] = None


class CommandResult(BaseModel):
    success: bool
    unit_id: str
    message: str
    applied_state: Dict[str, Any]
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class BaseHVACAdapter(ABC):
    """
    Abstract Base Class for all HVAC Controller Adapters.
    Ensures safe validation, capability discovery, and standard telemetry & command execution.
    """

    def __init__(self, unit_id: str, config: Optional[Dict[str, Any]] = None):
        self.unit_id = unit_id
        self.config = config or {}

    @abstractmethod
    def get_device_info(self) -> Dict[str, Any]:
        """Returns metadata about the controller, protocol, model, and network address."""
        pass

    @abstractmethod
    def get_capabilities(self) -> HVACCapabilities:
        """Returns the hardware/firmware capabilities supported by this specific controller."""
        pass

    @abstractmethod
    def read_state(self) -> HVACState:
        """Reads latest sensor telemetry, setpoint, and confirmed equipment status."""
        pass

    def validate_command(self, command: HVACCommand) -> Tuple[bool, Optional[str]]:
        """
        Validates command parameters against equipment capabilities and safety limits.
        Prevents equipment damage from out-of-range setpoints or unsupported modes.
        """
        caps = self.get_capabilities()

        if command.target_temperature is not None:
            if command.target_temperature < caps.min_temperature:
                return False, f"Target temperature {command.target_temperature}°C is below minimum allowable limit ({caps.min_temperature}°C)."
            if command.target_temperature > caps.max_temperature:
                return False, f"Target temperature {command.target_temperature}°C exceeds maximum allowable limit ({caps.max_temperature}°C)."

        if command.mode is not None:
            normalized_mode = command.mode.upper()
            if normalized_mode not in [m.upper() for m in caps.supported_modes]:
                return False, f"Mode '{command.mode}' is not supported by this controller. Supported: {caps.supported_modes}."

        if command.fan_speed is not None:
            normalized_fan = command.fan_speed.upper()
            if normalized_fan not in [f.upper() for f in caps.supported_fan_speeds]:
                return False, f"Fan speed '{command.fan_speed}' is not supported. Supported: {caps.supported_fan_speeds}."

        return True, None

    @abstractmethod
    def send_command(self, command: HVACCommand) -> CommandResult:
        """
        Transmits validated command payload to the physical or simulated controller.
        Returns a CommandResult with execution status.
        """
        pass

    @abstractmethod
    def test_connection(self) -> Dict[str, Any]:
        """Pings or handshakes with the controller/gateway to verify connectivity."""
        pass
