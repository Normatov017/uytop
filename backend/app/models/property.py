from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, JSON, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import Currency, OperationType, OwnerType, PricePeriod, PropertyStatus, PropertyType


class Property(Base):
    __tablename__ = "properties"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), index=True)
    description: Mapped[str] = mapped_column(Text)
    operation_type: Mapped[OperationType] = mapped_column(Enum(OperationType), index=True)
    property_type: Mapped[PropertyType] = mapped_column(Enum(PropertyType), index=True)
    price: Mapped[Decimal] = mapped_column(Numeric(14, 2), index=True)
    currency: Mapped[Currency] = mapped_column(Enum(Currency), default=Currency.USD)
    price_period: Mapped[PricePeriod | None] = mapped_column(Enum(PricePeriod), nullable=True)
    district: Mapped[str] = mapped_column(String(120), index=True)
    city: Mapped[str] = mapped_column(String(120), default="Toshkent", index=True)
    address: Mapped[str] = mapped_column(String(255), default="")
    latitude: Mapped[float | None] = mapped_column(nullable=True)
    longitude: Mapped[float | None] = mapped_column(nullable=True)
    rooms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    area_m2: Mapped[float | None] = mapped_column(nullable=True)
    floor: Mapped[int | None] = mapped_column(Integer, nullable=True)
    total_floors: Mapped[int | None] = mapped_column(Integer, nullable=True)
    metro_station: Mapped[str | None] = mapped_column(String(120), nullable=True, index=True)
    building_type: Mapped[str | None] = mapped_column(String(120), nullable=True)
    repair_type: Mapped[str | None] = mapped_column(String(120), nullable=True)
    document_status: Mapped[str | None] = mapped_column(String(120), nullable=True)
    owner_type: Mapped[OwnerType] = mapped_column(Enum(OwnerType), default=OwnerType.owner, index=True)
    status: Mapped[PropertyStatus] = mapped_column(Enum(PropertyStatus), default=PropertyStatus.pending, index=True)
    is_verified: Mapped[bool] = mapped_column(default=False, index=True)
    is_premium: Mapped[bool] = mapped_column(default=False, index=True)
    is_urgent: Mapped[bool] = mapped_column(default=False, index=True)
    urgent_reduction: Mapped[float | None] = mapped_column(nullable=True)
    auto_decrease_enabled: Mapped[bool] = mapped_column(default=False)
    auto_decrease_rate: Mapped[float | None] = mapped_column(nullable=True)
    virtual_tour_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    views_count: Mapped[int] = mapped_column(Integer, default=0)
    phone_clicks: Mapped[int] = mapped_column(Integer, default=0)
    telegram_clicks: Mapped[int] = mapped_column(Integer, default=0)
    amenities: Mapped[list[str]] = mapped_column(JSON, default=list)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    owner = relationship("User", back_populates="properties")
    images = relationship("PropertyImage", back_populates="property", cascade="all, delete-orphan", order_by="PropertyImage.sort_order")
    favorites = relationship("Favorite", back_populates="property", cascade="all, delete-orphan")
