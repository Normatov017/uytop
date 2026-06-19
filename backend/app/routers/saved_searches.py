from fastapi import APIRouter, HTTPException

from app.core.deps import CurrentUser, DbSession
from app.models.saved_search import SavedSearch

router = APIRouter(prefix="/api/saved-searches", tags=["saved_searches"])


@router.get("")
def list_saved_searches(db: DbSession, user: CurrentUser) -> list[dict]:
    searches = db.query(SavedSearch).filter(SavedSearch.user_id == user.id).order_by(SavedSearch.created_at.desc()).all()
    return [
        {
            "id": s.id,
            "name": s.name,
            "filters": s.filters,
            "created_at": s.created_at.isoformat() if s.created_at else "",
        }
        for s in searches
    ]


@router.post("", status_code=201)
def create_saved_search(db: DbSession, user: CurrentUser, body: dict) -> dict:
    search = SavedSearch(
        user_id=user.id,
        name=body.get("name", ""),
        filters=body.get("filters", {}),
    )
    db.add(search)
    db.commit()
    db.refresh(search)
    return {"id": search.id, "name": search.name, "filters": search.filters}


@router.delete("/{search_id}")
def delete_saved_search(search_id: int, db: DbSession, user: CurrentUser) -> dict:
    search = db.query(SavedSearch).filter(SavedSearch.id == search_id, SavedSearch.user_id == user.id).first()
    if not search:
        raise HTTPException(404, "Saved search not found")
    db.delete(search)
    db.commit()
    return {"ok": True}
