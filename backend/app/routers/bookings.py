from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.booking import Booking, BookingStatus
from app.models.property import Property
from app.schemas.booking import BookingCreate, BookingRead

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.get("", response_model=list[BookingRead])
def my_bookings(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    bookings = db.query(Booking).filter(Booking.user_id == user.id).order_by(Booking.created_at.desc()).all()
    return [
        BookingRead(
            id=b.id, property_id=b.property_id,
            property_title=b.property.title if b.property else "",
            user_id=b.user_id, status=b.status.value,
            deposit_amount=b.deposit_amount, deposit_paid=b.deposit_paid,
            days=b.days, expires_at=b.expires_at, created_at=b.created_at,
        )
        for b in bookings
    ]


@router.post("", response_model=BookingRead, status_code=201)
def create_booking(
    body: BookingCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    from datetime import timedelta, datetime, timezone
    prop = db.query(Property).filter(Property.id == body.property_id).first()
    if not prop:
        raise HTTPException(404, "Property not found")

    existing = db.query(Booking).filter(
        Booking.property_id == body.property_id,
        Booking.status.in_([BookingStatus.pending, BookingStatus.confirmed]),
    ).first()
    if existing:
        raise HTTPException(400, "Property already booked")

    deposit = float(prop.price) * 0.02
    booking = Booking(
        property_id=body.property_id,
        user_id=user.id,
        deposit_amount=deposit,
        days=body.days,
        expires_at=datetime.now(timezone.utc) + timedelta(days=body.days),
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return _booking_read(booking, prop.title if prop else "")


@router.patch("/{booking_id}/pay")
def pay_deposit(
    booking_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    booking = db.query(Booking).filter(Booking.id == booking_id, Booking.user_id == user.id).first()
    if not booking:
        raise HTTPException(404, "Booking not found")
    if booking.status != BookingStatus.pending:
        raise HTTPException(400, "Booking is not pending")
    booking.deposit_paid = True
    booking.status = BookingStatus.confirmed
    db.commit()
    return {"ok": True}


@router.delete("/{booking_id}")
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    booking = db.query(Booking).filter(Booking.id == booking_id, Booking.user_id == user.id).first()
    if not booking:
        raise HTTPException(404, "Booking not found")
    booking.status = BookingStatus.cancelled
    db.commit()
    return {"ok": True}


def _booking_read(b: Booking, prop_title: str = "") -> BookingRead:
    return BookingRead(
        id=b.id, property_id=b.property_id,
        property_title=prop_title,
        user_id=b.user_id, status=b.status.value,
        deposit_amount=b.deposit_amount, deposit_paid=b.deposit_paid,
        days=b.days, expires_at=b.expires_at, created_at=b.created_at,
    )
