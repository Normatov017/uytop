from datetime import datetime

from pydantic import BaseModel


class BookingRead(BaseModel):
    id: int
    property_id: int
    property_title: str = ""
    user_id: int
    status: str
    deposit_amount: float | None = None
    deposit_paid: bool
    days: int
    expires_at: datetime
    created_at: datetime

    model_config = {"from_attributes": True}


class BookingCreate(BaseModel):
    property_id: int
    days: int = 3
