from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])

@router.get("", response_model=List[schemas.AlertResponse])
def get_alerts(
    unit_id: str = "HVAC-001",
    is_resolved: Optional[bool] = None,
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    query = db.query(models.Alert).filter(models.Alert.unit_id == unit_id)
    if is_resolved is not None:
        query = query.filter(models.Alert.is_resolved == is_resolved)
    alerts = query.order_by(models.Alert.timestamp.desc()).limit(limit).all()
    return alerts

@router.post("/{alert_id}/resolve", response_model=schemas.AlertResponse)
def resolve_alert(
    alert_id: int,
    request: schemas.AlertResolveRequest,
    db: Session = Depends(get_db)
):
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.is_resolved = True
    alert.resolved_at = datetime.now(timezone.utc)
    alert.resolved_by = request.resolved_by or "Staff"
    db.commit()
    db.refresh(alert)
    return alert
