from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.core.config import settings
from app.core.deps import CurrentUser, DbSession
from app.models.property import Property
from app.models.user import User

router = APIRouter(prefix="/social-post", tags=["social-post"])


class PostResult(BaseModel):
    status: str
    url: str

class ShareLinks(BaseModel):
    telegram: str
    whatsapp: str
    facebook: str


@router.post("/telegram/{property_id}", response_model=PostResult)
def post_to_telegram(property_id: int, db: DbSession, current_user: CurrentUser):
    property = db.get(Property, property_id)
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")

    chat_id = current_user.telegram if current_user and current_user.telegram else None
    if not chat_id:
        raise HTTPException(status_code=400, detail="Sizning Telegram profilingiz ulanmagan. Profil sozlamalarida Telegram ulang.")

    if not settings.TELEGRAM_BOT_TOKEN:
        raise HTTPException(status_code=400, detail="Telegram bot not configured")

    url = f"{settings.FRONTEND_URL}/properties/{property_id}"
    caption = (
        f"<b>{property.title}</b>\n\n"
        f"💰 {property.price:,.2f} USD\n"
        f"📍 {property.district}, {property.city}\n"
        f"🛏 {property.rooms} xona · {property.area_m2:.0f} m²\n\n"
        f"{(property.description or '')[:200]}\n\n"
        f"🔗 <a href='{url}'>Batafsil ko'rish</a>"
    )

    import httpx

    chat_id_str = str(chat_id)
    first_image = property.images[0].url if property.images else None

    if first_image:
        resp = httpx.post(
            f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendPhoto",
            json={
                "chat_id": chat_id_str,
                "photo": first_image,
                "caption": caption,
                "parse_mode": "HTML",
            },
        )
    else:
        resp = httpx.post(
            f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage",
            json={
                "chat_id": chat_id_str,
                "text": caption,
                "parse_mode": "HTML",
            },
        )

    data = resp.json()
    if not data.get("ok"):
        raise HTTPException(status_code=502, detail=f"Telegram API error: {data.get('description', 'unknown')}")

    message_id = data["result"]["message_id"]
    url = f"https://t.me/{message_id}"
    return PostResult(status="posted", url=url)


@router.get("/link/{property_id}", response_model=ShareLinks)
def share_links(property_id: int):
    from urllib.parse import quote
    link = f"{settings.FRONTEND_URL}/properties/{property_id}"
    encoded = quote(link)
    return ShareLinks(
        telegram=f"https://t.me/share/url?url={encoded}",
        whatsapp=f"https://wa.me/?text={encoded}",
        facebook=f"https://www.facebook.com/sharer/sharer.php?u={encoded}",
    )
