import io

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from sqlalchemy import select

from app.core.config import settings
from app.core.deps import DbSession
from app.models.property import Property

router = APIRouter(prefix="/qr", tags=["qr"])


@router.get("/{property_id}")
def generate_qr(property_id: int, db: DbSession):
    property = db.get(Property, property_id)
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")

    url = f"{settings.FRONTEND_URL}/properties/{property_id}"

    import qrcode
    from qrcode.image.pil import PilImage

    img = qrcode.make(url, image_factory=PilImage)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    return Response(content=buf.getvalue(), media_type="image/png")
