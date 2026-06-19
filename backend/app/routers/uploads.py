from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.core.deps import CurrentUser
from app.services.upload_service import save_upload

router = APIRouter(prefix="/uploads", tags=["uploads"])


@router.post("", status_code=status.HTTP_201_CREATED)
async def upload_image(current_user: CurrentUser, file: UploadFile = File(...)) -> dict[str, str]:
    try:
        url = await save_upload(file)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return {"url": url}
