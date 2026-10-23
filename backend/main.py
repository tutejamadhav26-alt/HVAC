import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db, SessionLocal
import models
from auth import get_password_hash
from ml_engine import ml_engine
from simulator import simulator
from mqtt_client import mqtt_manager

from routers import auth, hvac, sensors, predictions, alerts, energy, simulation, websocket, system, commercial, audit

app = FastAPI(
    title="Smart HVAC Monitoring & Prediction System API",
    description="Full-stack AI-Based HVAC Diagnostics, Fault Classification, and Predictive Maintenance Engine",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local & mobile testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(hvac.router)
app.include_router(sensors.router)
app.include_router(predictions.router)
app.include_router(alerts.router)
app.include_router(energy.router)
app.include_router(simulation.router)
app.include_router(websocket.router)
app.include_router(system.router)
app.include_router(commercial.router)
app.include_router(audit.router)


def seed_initial_data():
    db = SessionLocal()
    try:
        # 1. Seed Default Users
        demo_users = [
            ("admin@airconiq.ai", "admin123", "Director of Facilities", "admin"),
            ("tech@airconiq.ai", "tech123", "Chief Diagnostic Engineer", "technician"),
            ("auditor@airconiq.ai", "audit123", "ESG Energy Auditor", "auditor"),
            ("admin@hvac.com", "admin123", "Facility Administrator", "admin"),
            ("staff@hvac.com", "staff123", "Facility Technician", "staff")
        ]
        for email, pwd, name, role in demo_users:
            u = db.query(models.User).filter(models.User.email == email).first()
            if not u:
                u = models.User(
                    email=email,
                    hashed_password=get_password_hash(pwd),
                    full_name=name,
                    role=role
                )
                db.add(u)

        # 2. Seed Default HVAC Unit
        unit = db.query(models.HVACUnit).filter(models.HVACUnit.unit_id == "HVAC-001").first()
        if not unit:
            unit = models.HVACUnit(
                unit_id="HVAC-001",
                name="Main Building Air Handler Unit",
                location="Building A - Mech Floor 2",
                status="NORMAL"
            )
            db.add(unit)

        db.commit()
        print("[+] Seeded initial users (admin@hvac.com / admin123) and default HVAC Unit HVAC-001.")
    finally:
        db.close()

@app.on_event("startup")
async def startup_event():
    # 1. Initialize Database Tables
    init_db()
    # 2. Seed Default Database Content
    seed_initial_data()
    # 3. Connect WebSocket Loop to Manager
    loop = asyncio.get_event_loop()
    websocket.manager.set_loop(loop)
    # 4. Attach WebSocket Callback to Simulator and MQTT Manager
    simulator.set_broadcast_callback(websocket.manager.broadcast_from_thread)
    mqtt_manager.set_broadcast_callback(websocket.manager.broadcast_from_thread)
    # 5. Start Simulator & MQTT Client automatically
    simulator.start(scenario="NORMAL", speed_multiplier=1.0)
    mqtt_manager.start()
    print("[+] Smart HVAC Backend API ready and operational.")

@app.on_event("shutdown")
def shutdown_event():
    simulator.stop()
    mqtt_manager.stop()
    print("[+] Smart HVAC Backend API shutdown completed.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
