from datetime import datetime

from pydantic import BaseModel


class ApartmentUnitRead(BaseModel):
    id: int
    building_id: int
    floor: int
    number: str
    rooms: int
    area_m2: float
    price: float
    status: str
    plan_image: str | None = None

    model_config = {"from_attributes": True}


class ApartmentUnitCreate(BaseModel):
    floor: int
    number: str
    rooms: int
    area_m2: float
    price: float
    plan_image: str | None = None


class BuildingRead(BaseModel):
    id: int
    developer_id: int
    name: str
    description: str
    district: str
    city: str
    address: str
    latitude: float | None = None
    longitude: float | None = None
    total_floors: int
    completion_date: str | None = None
    status: str
    created_at: datetime
    apartments: list[ApartmentUnitRead] = []

    model_config = {"from_attributes": True}


class BuildingCreate(BaseModel):
    name: str
    description: str = ""
    district: str
    city: str = "Toshkent"
    address: str = ""
    latitude: float | None = None
    longitude: float | None = None
    total_floors: int = 1
    completion_date: str | None = None
    apartments: list[ApartmentUnitCreate] = []
