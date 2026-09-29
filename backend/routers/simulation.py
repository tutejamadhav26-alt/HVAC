from fastapi import APIRouter, HTTPException
import schemas
from simulator import simulator

router = APIRouter(prefix="/api/simulation", tags=["Simulation Control"])

@router.post("/start", response_model=schemas.SimulationStatusResponse)
def start_simulation(config: schemas.SimulationConfig):
    simulator.start(scenario=config.scenario, speed_multiplier=config.speed_multiplier or 1.0)
    return {
        "is_running": simulator.is_running,
        "scenario": simulator.scenario,
        "speed_multiplier": simulator.speed_multiplier,
        "started_at": None
    }

@router.post("/stop", response_model=schemas.SimulationStatusResponse)
def stop_simulation():
    simulator.stop()
    return {
        "is_running": simulator.is_running,
        "scenario": simulator.scenario,
        "speed_multiplier": simulator.speed_multiplier,
        "started_at": None
    }

@router.post("/scenario", response_model=schemas.SimulationStatusResponse)
def set_simulation_scenario(config: schemas.SimulationConfig):
    valid_scenarios = ["NORMAL", "FILTER_CLOGGING", "COMPRESSOR_OVERLOAD", "REFRIGERANT_LEAKAGE", "RANDOM_FAULT"]
    if config.scenario not in valid_scenarios:
        raise HTTPException(status_code=400, detail=f"Invalid scenario. Choose from {valid_scenarios}")

    if not simulator.is_running:
        simulator.start(scenario=config.scenario, speed_multiplier=config.speed_multiplier or 1.0)
    else:
        simulator.set_scenario(config.scenario, speed_multiplier=config.speed_multiplier)

    return {
        "is_running": simulator.is_running,
        "scenario": simulator.scenario,
        "speed_multiplier": simulator.speed_multiplier,
        "started_at": None
    }

@router.get("/status", response_model=schemas.SimulationStatusResponse)
def get_simulation_status():
    return {
        "is_running": simulator.is_running,
        "scenario": simulator.scenario,
        "speed_multiplier": simulator.speed_multiplier,
        "started_at": None
    }
