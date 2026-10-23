"""
HVAC Adapter Factory & Registry
Instantiates and caches the correct controller adapter instance based on unit configuration.
"""

import json
from typing import Dict, Any, Optional
from adapters.base import BaseHVACAdapter
from adapters.central_ducted import CentralHVACAdapter
from adapters.vrf_vrv import VRFVRVAdapter
from adapters.simulator import SimulatorAdapter
from adapters.mqtt_esp32 import MQTTESP32Adapter

_adapter_cache: Dict[str, BaseHVACAdapter] = {}


def get_adapter_for_unit(unit_id: str, controller_type: str = "simulator", connection_params: Optional[Any] = None) -> BaseHVACAdapter:
    """
    Returns an adapter instance for the specified unit.
    Safely parses JSON connection parameters and matches the controller type.
    """
    config: Dict[str, Any] = {}
    if isinstance(connection_params, str) and connection_params.strip():
        try:
            config = json.loads(connection_params)
        except Exception:
            config = {}
    elif isinstance(connection_params, dict):
        config = connection_params

    ctrl_type = (controller_type or "simulator").lower().strip()

    if ctrl_type in ["central_ducted", "ducted", "central", "chiller", "ahu"]:
        return CentralHVACAdapter(unit_id=unit_id, config=config)
    elif ctrl_type in ["vrf_vrv", "vrf", "vrv", "multi_split"]:
        return VRFVRVAdapter(unit_id=unit_id, config=config)
    elif ctrl_type in ["mqtt_esp32", "esp32", "mqtt"]:
        return MQTTESP32Adapter(unit_id=unit_id, config=config)
    else:
        return SimulatorAdapter(unit_id=unit_id, config=config)
