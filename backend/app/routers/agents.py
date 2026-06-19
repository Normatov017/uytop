from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.enums import UserRole
from app.models.property import Property
from app.models.user import User

router = APIRouter(prefix="/agents", tags=["agents"])


@router.get("/analytics")
def agent_analytics(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if user.role not in (UserRole.AGENT, UserRole.ADMIN):
        return {"error": "Only agents and admins"}
    props = db.query(Property).filter(Property.owner_id == user.id).all()
    total = len(props)
    active = sum(1 for p in props if p.status == "active")
    sold = sum(1 for p in props if p.status == "sold")
    views = sum(p.views_count for p in props)
    phone_clicks = sum(p.phone_clicks for p in props)
    return {
        "total_listings": total,
        "active_listings": active,
        "sold_listings": sold,
        "total_views": views,
        "total_phone_clicks": phone_clicks,
        "conversion_rate": round(sold / total * 100, 1) if total > 0 else 0,
    }


@router.get("/leaderboard")
def agent_leaderboard(db: Session = Depends(get_db)):
    agents = db.query(User).filter(User.role == UserRole.AGENT).all()
    result = []
    for agent in agents:
        props = db.query(Property).filter(Property.owner_id == agent.id).all()
        active = sum(1 for p in props if p.status == "active")
        sold = sum(1 for p in props if p.status == "sold")
        views = sum(p.views_count for p in props)
        result.append({
            "id": agent.id,
            "full_name": agent.full_name,
            "total_listings": len(props),
            "active_listings": active,
            "sold_listings": sold,
            "total_views": views,
            "score": active * 10 + sold * 50 + views,
        })
    result.sort(key=lambda x: x["score"], reverse=True)
    return result[:20]
