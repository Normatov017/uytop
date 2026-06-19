from pydantic import BaseModel

from app.schemas.user import UserCreate, UserRead


class RegisterRequest(UserCreate):
    pass


class LoginRequest(BaseModel):
    phone_or_email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead
