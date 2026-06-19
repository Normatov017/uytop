from fastapi import APIRouter, HTTPException

from app.core.deps import DbSession
from app.models.price_history import PriceHistory
from app.models.property import Property

router = APIRouter(prefix="/api/price-history", tags=["price_history"])


@router.get("/{property_id}")
def get_price_history(property_id: int, db: DbSession) -> list[dict]:
    prop = db.get(Property, property_id)
    if not prop:
        raise HTTPException(404, "Property not found")
    records = (
        db.query(PriceHistory)
        .filter(PriceHistory.property_id == property_id)
        .order_by(PriceHistory.recorded_at.asc())
        .all()
    )
    return [
        {"price": r.price, "recorded_at": r.recorded_at.isoformat() if r.recorded_at else ""}
        for r in records
    ]
