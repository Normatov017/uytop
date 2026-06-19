from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from app.core.config import settings


ALLOWED_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "application/pdf": ".pdf",
}


async def save_upload(file: UploadFile) -> str:
    ext = ALLOWED_TYPES.get(file.content_type or "")
    if not ext:
        raise ValueError("Only JPG, PNG, WEBP and PDF files are allowed")

    root = Path(settings.MEDIA_ROOT)
    root.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid4().hex}{ext}"
    target = root / filename
    target.write_bytes(await file.read())
    return f"{settings.MEDIA_URL}/{filename}"
