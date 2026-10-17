from fastapi import APIRouter, HTTPException, status
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
from sqlalchemy import or_, select

from app.core.config import settings
from app.core.deps import CurrentUser, DbSession
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.enums import UserRole
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


@router.post("/telegram")
def telegram_auth(data: dict, db: DbSession):
    telegram_id = data.get("id")
    first_name = data.get("first_name", "")
    phone = data.get("phone", "")
    if not telegram_id:
        raise HTTPException(status_code=400, detail="Telegram ID is required")
    user = db.scalar(select(User).where(User.telegram == str(telegram_id)))
    if not user:
        email = f"tg_{telegram_id}@uymap.uz"
        user = User(
            full_name=first_name,
            phone=phone or f"+998{telegram_id}",
            email=email,
            telegram=str(telegram_id),
            hashed_password="",
            role=UserRole.USER,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return Token(access_token=create_access_token(user.id), user=user)


@router.post("/google", response_model=Token)
def google_auth(data: dict, db: DbSession) -> Token:
    credential = data.get("credential")
    if not credential:
        raise HTTPException(status_code=400, detail="Google credential is required")

    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="GOOGLE_CLIENT_ID not configured")

    try:
        info = google_id_token.verify_oauth2_token(
            credential, google_requests.Request(), settings.GOOGLE_CLIENT_ID
        )
    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {e}")

    google_id = info.get("sub")
    email = info.get("email", "")
    name = info.get("name", "")

    if not email:
        raise HTTPException(status_code=400, detail="Google account must have an email")

    user = db.scalar(select(User).where(User.google_id == google_id))
    if not user:
        user = db.scalar(select(User).where(User.email == email))
        if user:
            user.google_id = google_id
            db.commit()
            db.refresh(user)
        else:
            user = User(
                full_name=name[:160],
                phone=f"+1{google_id[:9]}",
                email=email,
                google_id=google_id,
                hashed_password="",
                role=UserRole.USER,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
    return Token(access_token=create_access_token(user.id), user=user)
