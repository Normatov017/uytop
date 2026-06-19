from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.price_alert import PriceAlert
from app.models.property import Property
from app.models.user import User

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("")
def my_alerts(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    alerts = (
        db.query(PriceAlert)
        .filter(PriceAlert.user_id == user.id)
        .order_by(PriceAlert.created_at.desc())
        .all()
    )
    return [
        {
            "id": a.id,
            "property_id": a.property_id,
            "property_title": a.property.title if a.property else "",
            "current_price": float(a.property.price) if a.property else 0,
            "target_price": a.target_price,
            "notified": a.notified,
            "created_at": a.created_at.isoformat() if a.created_at else "",
        }
        for a in alerts
    ]


@router.post("/{property_id}", status_code=201)
def create_alert(
    property_id: int,
    target_price: float | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(404, "Property not found")
    existing = (
        db.query(PriceAlert)
        .filter(
            PriceAlert.user_id == user.id,
            PriceAlert.property_id == property_id,
            PriceAlert.notified == False,
        )
        .first()
    )
    if existing:
        return {"id": existing.id, "message": "Already following"}
    alert = PriceAlert(
        user_id=user.id,
        property_id=property_id,
        target_price=target_price or (float(prop.price) * 0.95),
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return {"id": alert.id, "message": "Alert created"}


@router.delete("/{alert_id}")
def delete_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    alert = (
        db.query(PriceAlert)
        .filter(PriceAlert.id == alert_id, PriceAlert.user_id == user.id)
        .first()
    )
    if not alert:
        raise HTTPException(404, "Alert not found")
    db.delete(alert)
    db.commit()
    return {"ok": True}
