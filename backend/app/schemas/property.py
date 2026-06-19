from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field

from app.models.enums import Currency, OperationType, OwnerType, PricePeriod, PropertyStatus, PropertyType
from app.schemas.user import UserRead


class PropertyImageRead(BaseModel):
    id: int
    url: str
    is_main: bool
    sort_order: int
    created_at: datetime

    model_config = {"from_attributes": True}


class PropertyBase(BaseModel):
    title: str
    description: str = ""
    operation_type: OperationType
    property_type: PropertyType
    price: Decimal = Field(ge=0)
    currency: Currency = Currency.USD
    price_period: PricePeriod | None = None
    district: str
    city: str = "Toshkent"
    address: str = ""
    metro_station: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    rooms: int | None = None
    area_m2: float | None = None
    floor: int | None = None
    total_floors: int | None = None
    building_type: str | None = None
    repair_type: str | None = None
    document_status: str | None = None
    owner_type: OwnerType = OwnerType.owner
    amenities: list[str] = Field(default_factory=list)


class PropertyCreate(PropertyBase):
    image_urls: list[str] = Field(default_factory=list)


class PropertyUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    operation_type: OperationType | None = None
    property_type: PropertyType | None = None
    price: Decimal | None = Field(default=None, ge=0)
    currency: Currency | None = None
    price_period: PricePeriod | None = None
    district: str | None = None
    city: str | None = None
    address: str | None = None
    metro_station: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    rooms: int | None = None
    area_m2: float | None = None
    floor: int | None = None
    total_floors: int | None = None
    building_type: str | None = None
    repair_type: str | None = None
    document_status: str | None = None
    owner_type: OwnerType | None = None
    amenities: list[str] | None = None
    status: PropertyStatus | None = None
    is_verified: bool | None = None
    is_premium: bool | None = None


class PropertyRead(PropertyBase):
    id: int
    status: PropertyStatus
    is_verified: bool
    is_premium: bool
    views_count: int
    phone_clicks: int
    telegram_clicks: int
    owner_id: int
    owner: UserRead
    images: list[PropertyImageRead] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PropertyListResponse(BaseModel):
    items: list[PropertyRead]
    total: int
    page: int
    pages: int


class MapProperty(BaseModel):
    id: int
    title: str
    price: Decimal
    currency: Currency
    latitude: float | None
    longitude: float | None
    district: str

    model_config = {"from_attributes": True}
