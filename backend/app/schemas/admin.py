from pydantic import BaseModel

from app.models.enums import PropertyStatus


class ModerationUpdate(BaseModel):
    status: PropertyStatus
    is_verified: bool | None = None
    is_premium: bool | None = None


class AdminStats(BaseModel):
    total_properties: int
    active_properties: int
    pending_properties: int
    total_users: int
    agents: int
    today_properties: int
