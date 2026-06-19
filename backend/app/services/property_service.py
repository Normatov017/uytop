from math import ceil

import httpx
from fastapi import HTTPException, status
from sqlalchemy import Select, func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.core.config import settings
from app.models.enums import PropertyStatus
from app.models.image import PropertyImage
from app.models.price_history import PriceHistory
from app.models.property import Property
from app.models.user import User
from app.schemas.property import PropertyCreate, PropertyUpdate


def notify_telegram(prop: Property) -> None:
    if not settings.TELEGRAM_BOT_TOKEN:
        return
    price = f"${float(prop.price):,.0f}" if prop.currency.value == "USD" else f"{float(prop.price):,.0f} so'm"
    text = (
        f"🆕 Yangi e'lon!\n\n"
        f"🏠 {prop.title[:80]}\n"
        f"💰 {price}\n"
        f"📍 {prop.district} tumani\n"
        f"🔗 {settings.FRONTEND_URL}/?page=detail&id={prop.id}"
    )
    try:
        url = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage"
        httpx.post(url, json={"chat_id": "@uymap_uz", "text": text, "disable_web_page_preview": True}, timeout=5)
    except Exception:
        pass


def property_query() -> Select[tuple[Property]]:
    return select(Property).options(selectinload(Property.images), selectinload(Property.owner))


def _record_price(db: Session, prop: Property) -> None:
    db.add(PriceHistory(property_id=prop.id, price=float(prop.price)))


def create_property(db: Session, owner: User, payload: PropertyCreate) -> Property:
    data = payload.model_dump(exclude={"image_urls"})
    prop = Property(**data, owner_id=owner.id)
    db.add(prop)
    db.flush()
    for index, url in enumerate(payload.image_urls):
        db.add(PropertyImage(property_id=prop.id, url=url, is_main=index == 0, sort_order=index))
    _record_price(db, prop)
    db.commit()
    db.refresh(prop)
    notify_telegram(prop)
    return prop


def update_property(db: Session, prop: Property, payload: PropertyUpdate) -> Property:
    updates = payload.model_dump(exclude_unset=True)
    price_changed = "price" in updates and float(updates["price"]) != float(prop.price)
    for key, value in updates.items():
        setattr(prop, key, value)
    if price_changed:
        _record_price(db, prop)
    db.add(prop)
    db.commit()
    db.refresh(prop)
    return prop


def ensure_owner_or_admin(prop: Property, user: User) -> None:
    if prop.owner_id != user.id and user.role.value != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")


def apply_property_filters(stmt: Select[tuple[Property]], filters: dict) -> Select[tuple[Property]]:
    for key in ["operation_type", "property_type", "city", "district", "metro_station", "rooms", "floor", "repair_type", "owner_type", "is_verified", "is_premium"]:
        value = filters.get(key)
        if value is not None and value != "":
            stmt = stmt.where(getattr(Property, key) == value)

    if filters.get("min_price") is not None:
        stmt = stmt.where(Property.price >= filters["min_price"])
    if filters.get("max_price") is not None:
        stmt = stmt.where(Property.price <= filters["max_price"])
    if filters.get("min_area") is not None:
        stmt = stmt.where(Property.area_m2 >= filters["min_area"])
    if filters.get("max_area") is not None:
        stmt = stmt.where(Property.area_m2 <= filters["max_area"])
    if filters.get("search"):
        term = f"%{filters['search']}%"
        stmt = stmt.where(or_(Property.title.ilike(term), Property.description.ilike(term), Property.address.ilike(term), Property.district.ilike(term), Property.metro_station.ilike(term)))

    sort = filters.get("sort") or "newest"
    if sort == "cheapest":
        stmt = stmt.order_by(Property.price.asc())
    elif sort == "expensive":
        stmt = stmt.order_by(Property.price.desc())
    elif sort == "popular":
        stmt = stmt.order_by(Property.views_count.desc())
    else:
        stmt = stmt.order_by(Property.created_at.desc())
    return stmt


def paginate_properties(db: Session, stmt: Select[tuple[Property]], page: int, limit: int) -> tuple[list[Property], int, int]:
    count_stmt = select(func.count()).select_from(stmt.order_by(None).subquery())
    total = db.scalar(count_stmt) or 0
    pages = max(ceil(total / limit), 1)
    items = db.scalars(stmt.offset((page - 1) * limit).limit(limit)).all()
    return list(items), total, pages


def get_property_or_404(db: Session, property_id: int) -> Property:
    prop = db.scalars(property_query().where(Property.id == property_id)).first()
    if not prop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
    return prop


def public_active_query() -> Select[tuple[Property]]:
    return property_query().where(Property.status == PropertyStatus.active)
