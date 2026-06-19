from fastapi import APIRouter, HTTPException, status
from sqlalchemy import or_, select

from app.core.deps import CurrentUser, DbSession
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, Token
from app.schemas.user import UserRead

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: DbSession) -> Token:
    email = payload.email.strip() if payload.email else ""
    if not email:
        email = f"user_{payload.phone.replace('+', '')}@uymap.uz"

    exists = db.scalar(select(User).where(or_(User.email == email, User.phone == payload.phone)))
    if exists:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Phone or email already registered")

    user = User(
        full_name=payload.full_name,
        phone=payload.phone,
        email=email,
        role=payload.role,
        region=payload.region,
        district=payload.district,
        hashed_password=get_password_hash(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return Token(access_token=create_access_token(user.id), user=user)


@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: DbSession) -> Token:
    user = db.scalar(
        select(User).where(or_(User.email == payload.phone_or_email, User.phone == payload.phone_or_email))
    )
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect phone/email or password")
    return Token(access_token=create_access_token(user.id), user=user)


@router.get("/me", response_model=UserRead)
def me(current_user: CurrentUser) -> User:
    return current_user
