from fastapi import APIRouter, HTTPException
from sqlalchemy import select, func

from app.core.deps import CurrentUser, DbSession
from app.models.notification import Notification

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("")
def list_notifications(db: DbSession, current_user: CurrentUser):
    notifications = db.scalars(
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(50)
    ).all()
    return [
        {
            "id": n.id,
            "type": n.type,
            "title": n.title,
            "message": n.message,
            "is_read": n.is_read,
            "link": n.link,
            "created_at": n.created_at.isoformat() if n.created_at else "",
        }
        for n in notifications
    ]


@router.get("/unread-count")
def unread_notification_count(db: DbSession, current_user: CurrentUser):
    count = db.scalar(
        select(func.count(Notification.id))
        .where(Notification.user_id == current_user.id, Notification.is_read == False)
    )
    return {"unread": count if count else 0}


@router.patch("/{notification_id}/read")
def mark_read(notification_id: int, db: DbSession, current_user: CurrentUser):
    notification = db.get(Notification, notification_id)
    if not notification or notification.user_id != current_user.id:
        raise HTTPException(404, "Notification not found")
    notification.is_read = True
    db.commit()
    return {"ok": True}
