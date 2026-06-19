from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlalchemy import select

from app.core.config import settings
from app.core.deps import DbSession
from app.models.property import Property

router = APIRouter(prefix="/social-post", tags=["social-post"])


class PostResult(BaseModel):
    status: str
    url: str

class ShareLinks(BaseModel):
    telegram: str
    whatsapp: str
    facebook: str


@router.post("/telegram/{property_id}", response_model=PostResult)
def post_to_telegram(property_id: int, db: DbSession):
    property = db.get(Property, property_id)
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")

    if not settings.TELEGRAM_BOT_TOKEN:
        raise HTTPException(status_code=400, detail="Telegram bot not configured")

    first_image = None
    if property.images:
        first_image = property.images[0].url

    description = (property.description or "")[:200]
    link = f"{settings.FRONTEND_URL}/properties/{property_id}"
    caption = f"<b>{property.title}</b>\n\n💰 {property.price:,.2f} USD\n\n{description}\n\n🔗 <a href='{link}'>Ko'rish</a>"

    import httpx
    resp = httpx.post(
        f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendPhoto" if first_image
        else f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage",
        json={
            "chat_id": "@uytop_uz",
            "photo": first_image,
            "caption": caption,
            "parse_mode": "HTML",
            "text": caption,
            "disable_web_page_preview": False,
        } if first_image else {
            "chat_id": "@uytop_uz",
            "text": caption,
            "parse_mode": "HTML",
            "disable_web_page_preview": False,
        },
    )
    data = resp.json()
    if not data.get("ok"):
        raise HTTPException(status_code=502, detail=f"Telegram API error: {data.get('description', 'unknown')}")

    message_id = data["result"]["message_id"]
    url = f"https://t.me/uytop_uz/{message_id}"
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
