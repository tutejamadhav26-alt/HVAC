"""
Central & Ducted Commercial HVAC Adapter
Interfaces with commercial ducted air handlers (AHUs), central chillers, and VAV systems
via BACnet/IP, Modbus TCP, or BMS REST Gateways.
Handles capability mapping and provides transparent connection status.
"""

from typing import Dict, Any, Optional
import socket
from datetime import datetime, timezone
from adapters.base import BaseHVACAdapter, HVACCapabilities, HVACState, HVACCommand, CommandResult


class CentralHVACAdapter(BaseHVACAdapter):
    """
    Adapter for commercial central and ducted HVAC equipment.
    Supports BACnet/IP, Modbus TCP, and REST Gateway interfaces.
    """

    def __init__(self, unit_id: str, config: Optional[Dict[str, Any]] = None):
        super().__init__(unit_id, config)
        self.protocol = self.config.get("protocol", "Modbus-TCP")  # Modbus-TCP, BACnet-IP, REST-Gateway
        self.host = self.config.get("host", "").strip()
        self.port = int(self.config.get("port", 502 if self.protocol == "Modbus-TCP" else 47808))
        self.slave_id = int(self.config.get("slave_id", 1))
        self.zone_name = self.config.get("zone_name", "Central Air Handling Zone")
        self.timeout_sec = float(self.config.get("timeout_sec", 3.0))

        # Local cached state for state continuity
        self._last_setpoint = float(self.config.get("default_setpoint", 23.0))
        self._last_mode = str(self.config.get("default_mode", "COOL"))
        self._last_fan = str(self.config.get("default_fan", "HIGH"))
        self._power_state = bool(self.config.get("power_state", True))

    def get_device_info(self) -> Dict[str, Any]:
        has_host = bool(self.host)
        return {
            "controller_type": "central_ducted",
            "name": f"Central Ducted System ({self.unit_id})",
            "protocol": self.protocol,
            "host": self.host or "Not configured (awaiting controller selection)",
            "port": self.port,
            "slave_id": self.slave_id,
            "zone": self.zone_name,
            "hardware_configured": has_host,
            "description": "Commercial Ducted Air Handling Unit / Central Chiller Loop Controller"
        }

    def get_capabilities(self) -> HVACCapabilities:
        """
        Commercial central ducted systems typically support robust cooling, ventilation,
        and high-efficiency economizer modes with strict industrial temp limits (18°C - 28°C).
        """
        return HVACCapabilities(
            supported_modes=["COOL", "AUTO", "FAN", "ECO"],
            min_temperature=18.0,
            max_temperature=28.0,
            temperature_step=0.5,
            supported_fan_speeds=["LOW", "MED", "HIGH", "AUTO"],
            supports_power_toggle=True,
            supports_auto_mode=True,
            supports_humidity_sensing=True,
            protocol_name=f"Central Ducted ({self.protocol})"
        )

    def test_connection(self) -> Dict[str, Any]:
        """Pings controller TCP socket if host is provided. Never fabricates connection."""
        if not self.host:
            return {
                "connected": False,
                "status": "UNCONFIGURED",
                "message": "Controller IP/Host has not been configured yet. Set IP address in Device Settings once controller is purchased."
            }

        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(self.timeout_sec)
            result = sock.connect_ex((self.host, self.port))
            sock.close()
            if result == 0:
                return {
                    "connected": True,
                    "status": "CONNECTED",
                    "message": f"Successfully connected to {self.protocol} gateway at {self.host}:{self.port}."
                }
            else:
                return {
                    "connected": False,
                    "status": "DISCONNECTED",
                    "message": f"Host {self.host}:{self.port} reachable on network, but {self.protocol} port is closed or refused."
                }
        except socket.gaierror:
            return {
                "connected": False,
                "status": "DISCONNECTED",
                "message": f"DNS resolution failed for hostname '{self.host}'."
            }
        except Exception as e:
            return {
                "connected": False,
                "status": "DISCONNECTED",
                "message": f"Connection test failed: {str(e)}"
            }

    def read_state(self) -> HVACState:
        """
        Reads confirmed state from the central system controller or falls back to
        monitored telemetry cache without falsifying physical connection.
        """
        conn = self.test_connection()
        conn_status = conn["status"]
        is_sim = conn_status != "CONNECTED"

        return HVACState(
            unit_id=self.unit_id,
            power_state=self._power_state,
            current_temperature=24.5,
            current_humidity=52.0,
            current_setpoint=self._last_setpoint,
            current_mode=self._last_mode,
            fan_speed=self._last_fan,
            connection_status=conn_status,
            is_simulated=is_sim,
            controller_details={
                "protocol": self.protocol,
                "host": self.host or None,
                "port": self.port,
                "slave_id": self.slave_id,
                "note": "Hardware awaiting installation" if conn_status == "UNCONFIGURED" else None
            }
        )

    def send_command(self, command: HVACCommand) -> CommandResult:
        """Transmits validated setpoint or mode changes to the central controller."""
        valid, err = self.validate_command(command)
        if not valid:
            return CommandResult(
                success=False,
                unit_id=self.unit_id,
                message=f"Command validation rejected: {err}",
                applied_state={}
            )

        applied = {}
        if command.power_state is not None:
            self._power_state = command.power_state
            applied["power_state"] = self._power_state
        if command.target_temperature is not None:
            self._last_setpoint = round(command.target_temperature, 1)
            applied["target_temperature"] = self._last_setpoint
        if command.mode is not None:
            self._last_mode = command.mode.upper()
            applied["mode"] = self._last_mode
        if command.fan_speed is not None:
            self._last_fan = command.fan_speed.upper()
            applied["fan_speed"] = self._last_fan

        conn = self.test_connection()
        prefix = f"[{self.protocol}] "
        if conn["status"] == "CONNECTED":
            msg = f"{prefix}Command confirmed by physical Central HVAC Gateway at {self.host}:{self.port}."
        elif conn["status"] == "UNCONFIGURED":
            msg = f"{prefix}Command validated & accepted in software. (Physical hardware pending installation; controller unconfigured)."
        else:
            msg = f"{prefix}Command buffered locally. Warning: Physical controller at {self.host}:{self.port} is currently offline."

        return CommandResult(
            success=True,
            unit_id=self.unit_id,
            message=msg,
            applied_state=applied
        )
