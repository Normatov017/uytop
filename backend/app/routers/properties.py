from decimal import Decimal

from fastapi import APIRouter, Query, Request, Response, status
from pydantic import BaseModel
from sqlalchemy import select, update

from app.core.deps import CurrentUser, DbSession
from app.models.enums import OperationType, OwnerType, PropertyStatus, PropertyType
from app.models.property import Property
from app.models.view_log import ViewLog
from app.schemas.property import MapProperty, PropertyCreate, PropertyListResponse, PropertyRead, PropertyUpdate
from app.schemas.insight import AVMEstimate, PropertyInsight
from app.services.insight_service import build_property_insight, estimate_avm
from app.services.property_service import (
    apply_property_filters,
    create_property,
    ensure_owner_or_admin,
    get_property_or_404,
    paginate_properties,
    public_active_query,
    property_query,
    update_property,
)


class AutoDecreaseConfig(BaseModel):
    enabled: bool
    rate: float | None = None

router = APIRouter(prefix="/properties", tags=["properties"])


@router.get("", response_model=PropertyListResponse)
def list_properties(
    db: DbSession,
    operation_type: OperationType | None = None,
    property_type: PropertyType | None = None,
    city: str | None = None,
    district: str | None = None,
    metro_station: str | None = None,
    min_price: Decimal | None = None,
    max_price: Decimal | None = None,
    rooms: int | None = None,
    min_area: float | None = None,
    max_area: float | None = None,
    floor: int | None = None,
    repair_type: str | None = None,
    owner_type: OwnerType | None = None,
    is_verified: bool | None = None,
    is_premium: bool | None = None,
    search: str | None = None,
    sort: str = Query("newest", pattern="^(newest|cheapest|expensive|popular)$"),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100),
) -> PropertyListResponse:
    filters = locals()
    stmt = apply_property_filters(public_active_query(), filters)
    items, total, pages = paginate_properties(db, stmt, page, limit)
    return PropertyListResponse(items=items, total=total, page=page, pages=pages)


@router.get("/featured", response_model=list[PropertyRead])
def featured_properties(db: DbSession, limit: int = Query(8, ge=1, le=24)) -> list[Property]:
    stmt = public_active_query().where((Property.is_premium.is_(True)) | (Property.is_verified.is_(True))).limit(limit)
    return list(db.scalars(stmt).all())


@router.get("/map", response_model=list[MapProperty])
def map_properties(db: DbSession) -> list[Property]:
    stmt = select(Property).where(
        Property.status == PropertyStatus.active,
        Property.latitude.is_not(None),
        Property.longitude.is_not(None),
    )
    return list(db.scalars(stmt).all())


@router.get("/mine", response_model=list[PropertyRead])
def my_properties(db: DbSession, current_user: CurrentUser) -> list[Property]:
    return list(db.scalars(property_query().where(Property.owner_id == current_user.id).order_by(Property.created_at.desc())).all())


@router.get("/{property_id}", response_model=PropertyRead)
def get_property(property_id: int, db: DbSession, request: Request) -> Property:
    prop = get_property_or_404(db, property_id)
    db.execute(update(Property).where(Property.id == property_id).values(views_count=Property.views_count + 1))
    db.add(
        ViewLog(
            property_id=property_id,
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent", "")[:255],
        )
    )
    db.commit()
    db.refresh(prop)
    return prop


@router.get("/{property_id}/insights", response_model=PropertyInsight)
def property_insights(property_id: int, db: DbSession) -> PropertyInsight:
    return build_property_insight(get_property_or_404(db, property_id))


@router.get("/{property_id}/avm", response_model=AVMEstimate)
def property_avm(property_id: int, db: DbSession) -> AVMEstimate:
    return estimate_avm(get_property_or_404(db, property_id), db)


@router.get("/{property_id}/similar", response_model=list[PropertyRead])
def similar_properties(property_id: int, db: DbSession) -> list[Property]:
    prop = get_property_or_404(db, property_id)
    q = property_query().filter(
        Property.id != property_id,
        Property.status == "active",
        Property.district == prop.district,
        Property.operation_type == prop.operation_type,
    )
    from sqlalchemy import or_
    price = float(prop.price)
    q = q.filter(
        or_(
            Property.price.between(price * 0.7, price * 1.3),
            Property.rooms == prop.rooms,
        )
    )
    return list(q.order_by(Property.created_at.desc()).limit(6).all())


@router.post("/{property_id}/contact/{channel}")
def track_contact_click(property_id: int, channel: str, db: DbSession) -> dict[str, str]:
    get_property_or_404(db, property_id)
    if channel == "phone":
        db.execute(update(Property).where(Property.id == property_id).values(phone_clicks=Property.phone_clicks + 1))
    elif channel == "telegram":
        db.execute(update(Property).where(Property.id == property_id).values(telegram_clicks=Property.telegram_clicks + 1))
    else:
        return {"status": "ignored"}
    db.commit()
    return {"status": "ok"}


@router.post("", response_model=PropertyRead, status_code=status.HTTP_201_CREATED)
def create(payload: PropertyCreate, db: DbSession, current_user: CurrentUser) -> Property:
    return create_property(db, current_user, payload)


@router.patch("/{property_id}", response_model=PropertyRead)
def update(property_id: int, payload: PropertyUpdate, db: DbSession, current_user: CurrentUser) -> Property:
    prop = get_property_or_404(db, property_id)
    ensure_owner_or_admin(prop, current_user)
    if current_user.role.value != "ADMIN":
        payload.status = PropertyStatus.pending
    return update_property(db, prop, payload)


@router.put("/{property_id}/auto-decrease")
def set_auto_decrease(property_id: int, body: AutoDecreaseConfig, db: DbSession, current_user: CurrentUser):
    prop = get_property_or_404(db, property_id)
    ensure_owner_or_admin(prop, current_user)
    prop.auto_decrease_enabled = body.enabled
    prop.auto_decrease_rate = body.rate
    db.commit()
    db.refresh(prop)
    return {
        "id": prop.id,
        "auto_decrease_enabled": prop.auto_decrease_enabled,
        "auto_decrease_rate": prop.auto_decrease_rate,
    }


@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(property_id: int, db: DbSession, current_user: CurrentUser) -> Response:
    prop = get_property_or_404(db, property_id)
    ensure_owner_or_admin(prop, current_user)
    db.delete(prop)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
