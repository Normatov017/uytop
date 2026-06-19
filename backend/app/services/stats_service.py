from datetime import date

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.enums import PropertyStatus, UserRole
from app.models.property import Property
from app.models.user import User
from app.schemas.admin import AdminStats


def get_admin_stats(db: Session) -> AdminStats:
    today = date.today()
    return AdminStats(
        total_properties=db.scalar(select(func.count(Property.id))) or 0,
        active_properties=db.scalar(select(func.count(Property.id)).where(Property.status == PropertyStatus.active)) or 0,
        pending_properties=db.scalar(select(func.count(Property.id)).where(Property.status == PropertyStatus.pending)) or 0,
        total_users=db.scalar(select(func.count(User.id))) or 0,
        agents=db.scalar(select(func.count(User.id)).where(User.role == UserRole.AGENT)) or 0,
        today_properties=db.scalar(select(func.count(Property.id)).where(func.date(Property.created_at) == today)) or 0,
    )
