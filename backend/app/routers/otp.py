from datetime import UTC, datetime, timedelta
from random import randint

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select

from app.core.deps import DbSession
from app.models.otp import OTP

router = APIRouter(prefix="/auth", tags=["auth"])


class SendOTPRequest(BaseModel):
    phone: str


class VerifyOTPRequest(BaseModel):
    phone: str
    code: str


@router.post("/send-otp")
def send_otp(payload: SendOTPRequest, db: DbSession) -> dict[str, str]:
    code = f"{randint(100000, 999999)}"
    expires = datetime.now(UTC) + timedelta(minutes=5)
    db.add(OTP(phone=payload.phone, code=code, expires_at=expires))
    db.commit()
    print(f"\n=== SMS OTP for {payload.phone}: {code} ===\n")
    return {"status": "otp_sent"}


@router.post("/verify-otp")
def verify_otp(payload: VerifyOTPRequest, db: DbSession) -> dict[str, str]:
    now = datetime.now(UTC)
    otp = db.scalar(
        select(OTP).where(
            OTP.phone == payload.phone,
            OTP.code == payload.code,
            OTP.is_used == False,
            OTP.expires_at > now,
        ).order_by(OTP.created_at.desc())
    )
    if not otp:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Noto'g'ri yoki muddati o'tgan kod")
    otp.is_used = True
    db.commit()
    return {"status": "verified"}
