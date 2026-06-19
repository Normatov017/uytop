from fastapi import APIRouter, Response, status
from sqlalchemy import select

from app.core.deps import CurrentUser, DbSession
from app.models.favorite import Favorite
from app.schemas.favorite import FavoriteRead
from app.services.property_service import get_property_or_404

router = APIRouter(prefix="/favorites", tags=["favorites"])


@router.get("", response_model=list[FavoriteRead])
def list_favorites(db: DbSession, current_user: CurrentUser) -> list[Favorite]:
    return list(db.scalars(select(Favorite).where(Favorite.user_id == current_user.id)).all())


@router.post("/{property_id}", response_model=FavoriteRead, status_code=status.HTTP_201_CREATED)
def add_favorite(property_id: int, db: DbSession, current_user: CurrentUser) -> Favorite:
    get_property_or_404(db, property_id)
    favorite = db.scalar(select(Favorite).where(Favorite.user_id == current_user.id, Favorite.property_id == property_id))
    if favorite:
        return favorite
    favorite = Favorite(user_id=current_user.id, property_id=property_id)
    db.add(favorite)
    db.commit()
    db.refresh(favorite)
    return favorite


@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_favorite(property_id: int, db: DbSession, current_user: CurrentUser) -> Response:
    favorite = db.scalar(select(Favorite).where(Favorite.user_id == current_user.id, Favorite.property_id == property_id))
    if favorite:
        db.delete(favorite)
        db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
