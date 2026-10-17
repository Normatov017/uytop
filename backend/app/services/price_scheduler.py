from datetime import datetime, timedelta, timezone

from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy import select

from app.core.database import SessionLocal
from app.models.boost import PropertyBoost
from app.models.enums import PropertyStatus
from app.models.notification import Notification
from app.models.property import Property

scheduler = BackgroundScheduler()


def check_urgent_listings() -> None:
    db = SessionLocal()
    try:
        seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
        props = db.execute(
            select(Property).where(
                Property.is_urgent == True,
                Property.status == PropertyStatus.active,
                Property.created_at <= seven_days_ago,
            )
        ).scalars().all()
        for prop in props:
            prop.is_urgent = False
        db.commit()
    finally:
        db.close()


def check_expiring_listings() -> None:
    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        seven_days_from_now = now + timedelta(days=7)
        props = db.execute(
            select(Property).where(
                Property.status == PropertyStatus.active,
                Property.expires_at.is_not(None),
                Property.expires_at <= seven_days_from_now,
                Property.expires_at > now,
            )
        ).scalars().all()
        for prop in props:
            link = f"/detail/{prop.id}?reactivate=1"
            existing = db.execute(
                select(Notification).where(
                    Notification.user_id == prop.owner_id,
                    Notification.type == "expiry_reminder",
                    Notification.link == link,
                    Notification.created_at > (now - timedelta(days=1)),
                )
            ).first()
            if existing:
                continue
            days_left = (prop.expires_at - now).days
            db.add(Notification(
                user_id=prop.owner_id,
                type="expiry_reminder",
                title="E'lon muddati tugayapti",
                message=f"\"{prop.title}\" e'loningizga {days_left} kun qoldi. Qayta aktivatsiya qilish uchun bosing.",
                link=link,
            ))
        db.commit()
    finally:
        db.close()


def check_expired_listings() -> None:
    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        props = db.execute(
            select(Property).where(
                Property.status == PropertyStatus.active,
                Property.expires_at.is_not(None),
                Property.expires_at <= now,
            )
        ).scalars().all()
        for prop in props:
            prop.status = PropertyStatus.expired
        db.commit()
    finally:
        db.close()


def check_expired_boosts() -> None:
    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        expired = db.execute(
            select(PropertyBoost).where(
                PropertyBoost.is_active == True,
                PropertyBoost.expires_at <= now,
            )
        ).scalars().all()
        for boost in expired:
            boost.is_active = False
            prop = db.get(Property, boost.property_id)
            if prop:
                prop.is_premium = False
        db.commit()
    finally:
        db.close()


def reactivate_property(property_id: int) -> bool:
    db = SessionLocal()
    try:
        prop = db.get(Property, property_id)
        if not prop or prop.status not in (PropertyStatus.active, PropertyStatus.expired):
            return False
        prop.status = PropertyStatus.active
        prop.expires_at = datetime.now(timezone.utc) + timedelta(days=30)
        db.commit()
        return True
    finally:
        db.close()


def start_scheduler() -> None:
    scheduler.add_job(check_urgent_listings, "interval", hours=6, id="check_urgent")
    scheduler.add_job(check_expiring_listings, "interval", hours=1, id="check_expiring")
    scheduler.add_job(check_expired_listings, "interval", hours=1, id="check_expired")
    scheduler.add_job(check_expired_boosts, "interval", minutes=30, id="expired_boosts")
    scheduler.start()


def stop_scheduler() -> None:
    scheduler.shutdown()
