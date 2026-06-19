import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, JSON, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class BuildingStatus(str, enum.Enum):
    planning = "planning"
    construction = "construction"
    completed = "completed"


class ApartmentStatus(str, enum.Enum):
    free = "free"
    booked = "booked"
    sold = "sold"


class CompanyProfile(Base):
    __tablename__ = "company_profiles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True)
    company_name: Mapped[str] = mapped_column(String(255))
    license_number: Mapped[str] = mapped_column(String(100))
    company_phone: Mapped[str] = mapped_column(String(40))
    company_address: Mapped[str] = mapped_column(String(255), default="")
    company_description: Mapped[str] = mapped_column(Text, default="")
    logo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    documents: Mapped[list[str]] = mapped_column(JSON, default=list)
    is_verified: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")


class Building(Base):
    __tablename__ = "buildings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    developer_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, default="")
    district: Mapped[str] = mapped_column(String(120), index=True)
    city: Mapped[str] = mapped_column(String(120), default="Toshkent")
    address: Mapped[str] = mapped_column(String(255), default="")
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    total_floors: Mapped[int] = mapped_column(Integer, default=1)
    total_apartments: Mapped[int] = mapped_column(Integer, default=0)
    property_type: Mapped[str] = mapped_column(String(50), default="apartment")
    building_material: Mapped[str | None] = mapped_column(String(100), nullable=True)
    parking_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    elevator_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    images: Mapped[list[str]] = mapped_column(JSON, default=list)
    amenities: Mapped[list[str]] = mapped_column(JSON, default=list)
    completion_date: Mapped[str | None] = mapped_column(String(50), nullable=True)
    status: Mapped[BuildingStatus] = mapped_column(Enum(BuildingStatus), default=BuildingStatus.planning)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    developer = relationship("User")
    apartments = relationship("ApartmentUnit", back_populates="building", cascade="all, delete-orphan")


class ApartmentUnit(Base):
    __tablename__ = "apartment_units"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    building_id: Mapped[int] = mapped_column(ForeignKey("buildings.id", ondelete="CASCADE"), index=True)
    floor: Mapped[int] = mapped_column(Integer)
    number: Mapped[str] = mapped_column(String(20))
    rooms: Mapped[int] = mapped_column(Integer, default=1)
    area_m2: Mapped[float] = mapped_column(Float)
    price: Mapped[float] = mapped_column(Float)
    status: Mapped[ApartmentStatus] = mapped_column(Enum(ApartmentStatus), default=ApartmentStatus.free)
    plan_image: Mapped[str | None] = mapped_column(String(500), nullable=True)

    building = relationship("Building", back_populates="apartments")
