from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/hvac", tags=["HVAC Units"])

@router.get("", response_model=List[schemas.HVACUnitResponse])
def get_all_hvac_units(db: Session = Depends(get_db)):
    units = db.query(models.HVACUnit).all()
    if not units:
        # Create default HVAC-001 unit if none exists
        default_unit = models.HVACUnit(
            unit_id="HVAC-001",
            name="Main Chiller System",
            location="Building A - Mechanical Room 1",
            status="NORMAL"
        )
        db.add(default_unit)
        db.commit()
        db.refresh(default_unit)
        units = [default_unit]
    return units

@router.get("/{unit_id}", response_model=schemas.HVACUnitResponse)
def get_hvac_unit_by_id(unit_id: str, db: Session = Depends(get_db)):
    unit = db.query(models.HVACUnit).filter(models.HVACUnit.unit_id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="HVAC Unit not found")
    return unit
