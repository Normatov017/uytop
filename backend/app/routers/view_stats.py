from datetime import datetime, timezone, timedelta

from fastapi import APIRouter
from pydantic import BaseModel
from sqlalchemy import func

from app.core.deps import CurrentUser, DbSession
from app.models.property import Property
from app.models.view_log import ViewLog
from app.services.property_service import ensure_owner_or_admin, get_property_or_404

router = APIRouter(prefix="/view-stats", tags=["view-stats"])


class DailyView(BaseModel):
    date: str
    count: int


class ViewStatsResponse(BaseModel):
    views_count: int
    phone_clicks: int
    telegram_clicks: int
    recent_views: list[DailyView]
    unique_viewers: int


@router.get("/{property_id}", response_model=ViewStatsResponse)
def get_view_stats(property_id: int, db: DbSession, current_user: CurrentUser):
    prop = get_property_or_404(db, property_id)
    ensure_owner_or_admin(prop, current_user)

    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    recent = db.query(
        func.date_trunc("day", ViewLog.created_at).label("day"),
        func.count().label("cnt"),
    ).filter(
        ViewLog.property_id == property_id,
        ViewLog.created_at >= thirty_days_ago,
    ).group_by(func.date_trunc("day", ViewLog.created_at)).order_by(func.date_trunc("day", ViewLog.created_at)).all()

    unique_viewers = db.query(func.count(func.distinct(ViewLog.ip_address))).filter(
        ViewLog.property_id == property_id,
        ViewLog.ip_address.isnot(None),
    ).scalar() or 0

    return ViewStatsResponse(
        views_count=prop.views_count,
        phone_clicks=prop.phone_clicks,
        telegram_clicks=prop.telegram_clicks,
        recent_views=[
            DailyView(date=r.day.strftime("%Y-%m-%d"), count=r.cnt)
            for r in recent
        ],
        unique_viewers=unique_viewers,
    )
