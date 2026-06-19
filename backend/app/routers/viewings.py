from datetime import datetime

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import or_, select

from app.core.deps import CurrentUser, DbSession
from app.models.crm import PropertyViewing
from app.models.property import Property

router = APIRouter(prefix="/viewings", tags=["viewings"])


class ViewingCreate(BaseModel):
    property_id: int
    scheduled_at: datetime
    buyer_name: str
    buyer_phone: str
    notes: str | None = None

class ViewingStatusUpdate(BaseModel):
    status: str

class ViewingRead(ViewingCreate):
    id: int
    buyer_id: int
    seller_id: int
    status: str
    created_at: datetime
    model_config = {"from_attributes": True}


@router.post("", response_model=ViewingRead, status_code=status.HTTP_201_CREATED)
def create_viewing(payload: ViewingCreate, db: DbSession, current_user: CurrentUser):
    property = db.get(Property, payload.property_id)
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    viewing = PropertyViewing(
        property_id=payload.property_id,
        buyer_id=current_user.id,
        seller_id=property.owner_id,
        scheduled_at=payload.scheduled_at,
        buyer_name=payload.buyer_name,
        buyer_phone=payload.buyer_phone,
        notes=payload.notes,
    )
    db.add(viewing)
    db.commit()
    db.refresh(viewing)
    return viewing

@router.get("", response_model=list[ViewingRead])
def list_viewings(db: DbSession, current_user: CurrentUser):
    stmt = select(PropertyViewing).where(
        or_(PropertyViewing.buyer_id == current_user.id, PropertyViewing.seller_id == current_user.id)
    ).order_by(PropertyViewing.scheduled_at.desc())
    return list(db.scalars(stmt).all())

@router.put("/{viewing_id}/status", response_model=ViewingRead)
def update_viewing_status(viewing_id: int, payload: ViewingStatusUpdate, db: DbSession, current_user: CurrentUser):
    viewing = db.get(PropertyViewing, viewing_id)
    if not viewing:
        raise HTTPException(status_code=404, detail="Viewing not found")
    if viewing.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the seller can update viewing status")
    if payload.status not in ("pending", "confirmed", "completed", "cancelled"):
        raise HTTPException(status_code=400, detail="Invalid status")
    viewing.status = payload.status
    db.commit()
    db.refresh(viewing)
    return viewing
