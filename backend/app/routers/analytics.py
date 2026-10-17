from datetime import datetime, timezone, timedelta

from fastapi import APIRouter
from pydantic import BaseModel
from sqlalchemy import func

from app.core.deps import DbSession
from app.models.enums import PropertyStatus, UserRole
from app.models.property import Property
from app.models.user import User

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


class UserGrowthItem(BaseModel):
    month: str
    count: int


class ListingTrend(BaseModel):
    date: str
    count: int


class StatusBreakdown(BaseModel):
    status: str
    count: int


class AdminDashboard(BaseModel):
    total_properties: int
    active_properties: int
    pending_properties: int
    sold_properties: int
    rented_properties: int
    expired_properties: int
    total_users: int
    agents: int
    today_properties: int
    user_growth: list[UserGrowthItem]
    listing_trends: list[ListingTrend]
    status_breakdown: list[StatusBreakdown]
    market_summary: MarketSummary


class DistrictAnalytics(BaseModel):
    district: str
    avg_price: float | None
    avg_price_per_m2: float | None
    listings_count: int
    price_trends: list[PriceTrend]


@router.get("/user-growth", response_model=list[UserGrowthItem])
def user_growth_endpoint(db: DbSession):
    twelve_months_ago = datetime.now(timezone.utc) - timedelta(days=365)
    month_col = func.date_trunc("month", User.created_at).label("month")
    rows = db.query(
        month_col,
        func.count(User.id).label("cnt"),
    ).filter(
        User.created_at >= twelve_months_ago,
    ).group_by(month_col).order_by(month_col).all()
    return [
        UserGrowthItem(month=r.month.strftime("%Y-%m"), count=r.cnt)
        for r in rows
    ]


@router.get("/listing-trends", response_model=list[ListingTrend])
def listing_trends_endpoint(db: DbSession):
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    day_col = func.date_trunc("day", Property.created_at).label("day")
    rows = db.query(
        day_col,
        func.count(Property.id).label("cnt"),
    ).filter(
        Property.created_at >= thirty_days_ago,
    ).group_by(day_col).order_by(day_col).all()
    return [
        ListingTrend(date=r.day.strftime("%m-%d"), count=r.cnt)
        for r in rows
    ]


@router.get("/status-breakdown", response_model=list[StatusBreakdown])
def status_breakdown_endpoint(db: DbSession):
    rows = db.query(
        Property.status,
        func.count(Property.id).label("cnt"),
    ).group_by(Property.status).all()
    return [
        StatusBreakdown(status=r.status.value if hasattr(r.status, 'value') else str(r.status), count=r.cnt)
        for r in rows
    ]


@router.get("/dashboard", response_model=AdminDashboard)
def admin_dashboard(db: DbSession):
    now = datetime.now(timezone.utc)
    thirty_days_ago = now - timedelta(days=30)
    twelve_months_ago = now - timedelta(days=365)
    today = now.date()

    active_cond = Property.status == PropertyStatus.active

    total_props = db.query(func.count(Property.id)).scalar() or 0
    active_props = db.query(func.count(Property.id)).filter(active_cond).scalar() or 0
    pending_props = db.query(func.count(Property.id)).filter(Property.status == PropertyStatus.pending).scalar() or 0
    sold_props = db.query(func.count(Property.id)).filter(Property.status == PropertyStatus.sold).scalar() or 0
    rented_props = db.query(func.count(Property.id)).filter(Property.status == PropertyStatus.rented).scalar() or 0
    expired_props = db.query(func.count(Property.id)).filter(Property.status == PropertyStatus.expired).scalar() or 0
    total_users = db.query(func.count(User.id)).scalar() or 0
    agents = db.query(func.count(User.id)).filter(User.role == UserRole.AGENT).scalar() or 0
    today_props = db.query(func.count(Property.id)).filter(func.date(Property.created_at) == today).scalar() or 0

    month_col = func.date_trunc("month", User.created_at).label("month")
    user_rows = db.query(
        month_col,
        func.count(User.id).label("cnt"),
    ).filter(
        User.created_at >= twelve_months_ago,
    ).group_by(month_col).order_by(month_col).all()
    user_growth_items = [
        UserGrowthItem(month=r.month.strftime("%Y-%m"), count=r.cnt)
        for r in user_rows
    ]

    day_col = func.date_trunc("day", Property.created_at).label("day")
    listing_rows = db.query(
        day_col,
        func.count(Property.id).label("cnt"),
    ).filter(
        Property.created_at >= thirty_days_ago,
    ).group_by(day_col).order_by(day_col).all()
    listing_trend_items = [
        ListingTrend(date=r.day.strftime("%m-%d"), count=r.cnt)
        for r in listing_rows
    ]

    status_rows = db.query(
        Property.status,
        func.count(Property.id).label("cnt"),
    ).group_by(Property.status).all()
    status_items = [
        StatusBreakdown(status=r.status.value if hasattr(r.status, 'value') else str(r.status), count=r.cnt)
        for r in status_rows
    ]

    avg_price = db.query(func.avg(Property.price)).filter(active_cond).scalar()
    avg_per_m2 = db.query(func.avg(Property.price / func.nullif(Property.area_m2, 0))).filter(active_cond).scalar()
    district_rows = db.query(
        Property.district,
        func.count(Property.id).label("cnt"),
        func.avg(Property.price).label("avg_p"),
        func.avg(Property.price / func.nullif(Property.area_m2, 0)).label("avg_m2"),
    ).filter(active_cond).group_by(Property.district).all()
    by_district = [
        DistrictSummary(district=r.district, listings_count=r.cnt, avg_price=float(r.avg_p) if r.avg_p else None, avg_price_per_m2=float(r.avg_m2) if r.avg_m2 else None)
        for r in district_rows
    ]

    return AdminDashboard(
        total_properties=total_props,
        active_properties=active_props,
        pending_properties=pending_props,
        sold_properties=sold_props,
        rented_properties=rented_props,
        expired_properties=expired_props,
        total_users=total_users,
        agents=agents,
        today_properties=today_props,
        user_growth=user_growth_items,
        listing_trends=listing_trend_items,
        status_breakdown=status_items,
        market_summary=MarketSummary(
            total_listings=active_props,
            avg_price=float(avg_price) if avg_price else None,
            avg_price_per_m2=float(avg_per_m2) if avg_per_m2 else None,
            by_district=by_district,
        ),
    )


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
