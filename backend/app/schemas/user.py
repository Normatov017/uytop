from datetime import datetime

from pydantic import BaseModel, EmailStr

from app.models.enums import UserRole


class UserBase(BaseModel):
    full_name: str
    phone: str
    email: str = ""
    role: UserRole = UserRole.USER
    telegram: str = ""
    region: str = ""
    district: str = ""


class UserCreate(UserBase):
    password: str


class UserRead(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
