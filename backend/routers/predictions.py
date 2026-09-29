from typing import List
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/predictions", tags=["Predictions"])

@router.get("/latest", response_model=schemas.PredictionResponse)
def get_latest_prediction(unit_id: str = "HVAC-001", db: Session = Depends(get_db)):
    prediction = db.query(models.Prediction).filter(
        models.Prediction.unit_id == unit_id
    ).order_by(models.Prediction.timestamp.desc()).first()

    if not prediction:
        raise HTTPException(status_code=404, detail="No ML predictions generated yet.")
    return prediction

@router.get("/history", response_model=List[schemas.PredictionResponse])
def get_predictions_history(
    unit_id: str = "HVAC-001",
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    predictions = db.query(models.Prediction).filter(
        models.Prediction.unit_id == unit_id
    ).order_by(models.Prediction.timestamp.desc()).limit(limit).all()
    
    return predictions
