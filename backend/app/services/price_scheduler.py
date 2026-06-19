from datetime import datetime, timezone
from decimal import Decimal

from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy import update

from app.core.database import SessionLocal
from app.models.boost import PropertyBoost
from app.models.enums import PropertyStatus
from app.models.price_history import PriceHistory
from app.models.property import Property

scheduler = BackgroundScheduler()


def apply_auto_decrease() -> None:
    db = SessionLocal()
    try:
        props = db.query(Property).filter(
            Property.status == PropertyStatus.active,
            Property.auto_decrease_enabled == True,
            Property.auto_decrease_rate.isnot(None),
            Property.auto_decrease_rate > 0,
        ).all()
        for prop in props:
            rate = Decimal(str(prop.auto_decrease_rate)) / Decimal("100")
            new_price = prop.price * (Decimal("1") - rate)
            if new_price <= Decimal("0"):
                new_price = Decimal("1")
            db.add(PriceHistory(property_id=prop.id, price=float(new_price)))
            db.execute(
                update(Property)
                .where(Property.id == prop.id)
                .values(price=new_price)
            )
        db.commit()
    finally:
        db.close()


def check_expired_boosts() -> None:
    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        expired = db.query(PropertyBoost).filter(
            PropertyBoost.is_active == True,
            PropertyBoost.expires_at <= now,
        ).all()
        for boost in expired:
            boost.is_active = False
            prop = db.get(Property, boost.property_id)
            if prop:
                prop.is_premium = False
        db.commit()
    finally:
        db.close()


def start_scheduler() -> None:
    scheduler.add_job(apply_auto_decrease, "interval", hours=1, id="auto_decrease")
    scheduler.add_job(check_expired_boosts, "interval", minutes=30, id="expired_boosts")
    scheduler.start()


def stop_scheduler() -> None:
    scheduler.shutdown()
