import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Default to SQLite, override via DATABASE_URL env var for PostgreSQL
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./hvac.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL, connect_args=connect_args
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
    # Lightweight SQLite auto-migration for added columns
    if DATABASE_URL.startswith("sqlite"):
        with engine.connect() as conn:
            # 1. hvac_units columns
            res = conn.exec_driver_sql("PRAGMA table_info(hvac_units)").fetchall()
            existing_cols = [r[1] for r in res]
            new_hvac_cols = {
                "building_floor": "VARCHAR(50) DEFAULT 'Floor 1'",
                "zone_type": "VARCHAR(50) DEFAULT 'Commercial Office'",
                "brand": "VARCHAR(50) DEFAULT 'Daikin'",
                "current_setpoint": "FLOAT DEFAULT 24.0",
                "current_mode": "VARCHAR(20) DEFAULT 'AUTO'"
            }
            for col, col_type in new_hvac_cols.items():
                if existing_cols and col not in existing_cols:
                    try:
                        conn.exec_driver_sql(f"ALTER TABLE hvac_units ADD COLUMN {col} {col_type}")
                    except Exception:
                        pass

            # 2. sensor_readings columns
            res_s = conn.exec_driver_sql("PRAGMA table_info(sensor_readings)").fetchall()
            existing_sensor_cols = [r[1] for r in res_s]
            new_sensor_cols = {
                "occupancy": "INTEGER DEFAULT 0",
                "outdoor_temp": "FLOAT DEFAULT 33.0"
            }
            for col, col_type in new_sensor_cols.items():
                if existing_sensor_cols and col not in existing_sensor_cols:
                    try:
                        conn.exec_driver_sql(f"ALTER TABLE sensor_readings ADD COLUMN {col} {col_type}")
                    except Exception:
                        pass

            # 3. predictions columns
            res_p = conn.exec_driver_sql("PRAGMA table_info(predictions)").fetchall()
            existing_pred_cols = [r[1] for r in res_p]
            new_pred_cols = {
                "recommended_mode": "VARCHAR(20) DEFAULT 'AUTO'",
                "target_temperature": "FLOAT DEFAULT 24.0",
                "fan_speed": "VARCHAR(20) DEFAULT 'AUTO'",
                "energy_saving_pct": "FLOAT DEFAULT 15.0",
                "comfort_index": "FLOAT DEFAULT 92.0",
                "dew_point": "FLOAT DEFAULT 13.5",
                "cop_estimate": "FLOAT DEFAULT 3.4"
            }
            for col, col_type in new_pred_cols.items():
                if existing_pred_cols and col not in existing_pred_cols:
                    try:
                        conn.exec_driver_sql(f"ALTER TABLE predictions ADD COLUMN {col} {col_type}")
                    except Exception:
                        pass

            conn.commit()


