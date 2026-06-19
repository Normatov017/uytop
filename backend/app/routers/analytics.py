from datetime import datetime, timezone, timedelta

from fastapi import APIRouter
from pydantic import BaseModel
from sqlalchemy import func

from app.core.deps import DbSession
from app.models.enums import PropertyStatus
from app.models.property import Property

router = APIRouter(prefix="/analytics", tags=["analytics"])


class DistrictSummary(BaseModel):
    district: str
    listings_count: int
    avg_price: float | None
    avg_price_per_m2: float | None


class MarketSummary(BaseModel):
    total_listings: int
    avg_price: float | None
    avg_price_per_m2: float | None
    by_district: list[DistrictSummary]


class PriceTrend(BaseModel):
    month: str
    avg_price: float | None


class DistrictAnalytics(BaseModel):
    district: str
    avg_price: float | None
    avg_price_per_m2: float | None
    listings_count: int
    price_trends: list[PriceTrend]


@router.get("/market-summary", response_model=MarketSummary)
def market_summary(db: DbSession):
    active = Property.status == PropertyStatus.active

    total = db.query(func.count(Property.id)).filter(active).scalar() or 0
    avg_price = db.query(func.avg(Property.price)).filter(active).scalar()
    avg_per_m2 = db.query(func.avg(Property.price / func.nullif(Property.area_m2, 0))).filter(active).scalar()

    rows = db.query(
        Property.district,
        func.count(Property.id).label("cnt"),
        func.avg(Property.price).label("avg_p"),
        func.avg(Property.price / func.nullif(Property.area_m2, 0)).label("avg_m2"),
    ).filter(active).group_by(Property.district).all()

    by_district = [
        DistrictSummary(district=r.district, listings_count=r.cnt, avg_price=float(r.avg_p) if r.avg_p else None, avg_price_per_m2=float(r.avg_m2) if r.avg_m2 else None)
        for r in rows
    ]

    return MarketSummary(
        total_listings=total,
        avg_price=float(avg_price) if avg_price else None,
        avg_price_per_m2=float(avg_per_m2) if avg_per_m2 else None,
        by_district=by_district,
    )


@router.get("/district/{district}", response_model=DistrictAnalytics)
def district_analytics(district: str, db: DbSession):
    active = Property.status == PropertyStatus.active

    row = db.query(
        func.count(Property.id).label("cnt"),
        func.avg(Property.price).label("avg_p"),
        func.avg(Property.price / func.nullif(Property.area_m2, 0)).label("avg_m2"),
    ).filter(active, Property.district == district).first()

    twelve_months_ago = datetime.now(timezone.utc) - timedelta(days=365)
    month_col = func.date_trunc("month", Property.created_at).label("month")
    trends = db.query(
        month_col,
        func.avg(Property.price).label("avg_p"),
    ).filter(
        active,
        Property.district == district,
        Property.created_at >= twelve_months_ago,
    ).group_by(month_col).order_by(month_col).all()

    price_trends = [
        PriceTrend(month=r.month.strftime("%Y-%m"), avg_price=float(r.avg_p) if r.avg_p else None)
        for r in trends
    ]

    return DistrictAnalytics(
        district=district,
        avg_price=float(row.avg_p) if row and row.avg_p else None,
        avg_price_per_m2=float(row.avg_m2) if row and row.avg_m2 else None,
        listings_count=row.cnt if row else 0,
        price_trends=price_trends,
    )


@router.get("/price-trends", response_model=list[PriceTrend])
def price_trends(db: DbSession):
    twelve_months_ago = datetime.now(timezone.utc) - timedelta(days=365)
    month_col = func.date_trunc("month", Property.created_at).label("month")
    rows = db.query(
        month_col,
        func.avg(Property.price).label("avg_p"),
    ).filter(
        Property.status == PropertyStatus.active,
        Property.created_at >= twelve_months_ago,
    ).group_by(month_col).order_by(month_col).all()

    return [
        PriceTrend(month=r.month.strftime("%Y-%m"), avg_price=float(r.avg_p) if r.avg_p else None)
        for r in rows
    ]
