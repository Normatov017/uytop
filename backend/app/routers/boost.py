from datetime import datetime, timedelta, timezone
from decimal import Decimal

from fastapi import APIRouter
from pydantic import BaseModel

from app.core.deps import CurrentUser, DbSession
from app.models.boost import PropertyBoost
from app.models.enums import Currency
from app.models.property import Property
from app.services.property_service import ensure_owner_or_admin, get_property_or_404

router = APIRouter(prefix="/boost", tags=["boost"])


class BoostCreate(BaseModel):
    property_id: int
    days: int
    price_paid: Decimal
    currency: Currency


class BoostRead(BaseModel):
    id: int
    property_id: int
    days: int
    price_paid: Decimal
    currency: Currency
    starts_at: datetime
    expires_at: datetime
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


@router.post("", response_model=BoostRead, status_code=201)
def create_boost(body: BoostCreate, db: DbSession, current_user: CurrentUser):
    prop = get_property_or_404(db, body.property_id)
    ensure_owner_or_admin(prop, current_user)

    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=body.days)

    boost = PropertyBoost(
        property_id=body.property_id,
        user_id=current_user.id,
        days=body.days,
        price_paid=body.price_paid,
        currency=body.currency,
        starts_at=now,
        expires_at=expires_at,
    )
    prop.is_premium = True
    db.add(boost)
    db.commit()
    db.refresh(boost)
    return boost


@router.get("/active", response_model=list[BoostRead])
def list_active_boosts(db: DbSession, current_user: CurrentUser):
    now = datetime.now(timezone.utc)
    boosts = db.query(PropertyBoost).join(
        Property, PropertyBoost.property_id == Property.id
    ).filter(
        Property.owner_id == current_user.id,
        PropertyBoost.is_active == True,
        PropertyBoost.expires_at > now,
    ).all()

    # Expire any that are past due
    expired = [b for b in boosts if b.expires_at <= now]
    for b in expired:
        b.is_active = False
        prop = db.get(Property, b.property_id)
        if prop:
            prop.is_premium = False
    if expired:
        db.commit()

    return [b for b in boosts if b.is_active]
