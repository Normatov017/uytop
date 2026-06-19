from datetime import datetime
import secrets

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select

from app.core.deps import CurrentUser, DbSession
from app.models.referral import Referral
from app.models.user import User

router = APIRouter(prefix="/referrals", tags=["referrals"])


class ReferralCodeResponse(BaseModel):
    code: str

class ReferralClaim(BaseModel):
    code: str
    referred_id: int

class ReferralRead(BaseModel):
    id: int
    referrer_id: int
    referred_id: int
    code: str
    bonus_earned: float
    status: str
    created_at: datetime
    model_config = {"from_attributes": True}


@router.post("/generate", response_model=ReferralCodeResponse)
def generate_referral_code(db: DbSession, current_user: CurrentUser):
    existing = db.scalar(select(Referral).where(Referral.referrer_id == current_user.id))
    if existing:
        return ReferralCodeResponse(code=existing.code)
    code = secrets.token_hex(4).upper()
    while db.scalar(select(Referral).where(Referral.code == code)):
        code = secrets.token_hex(4).upper()
    referral = Referral(referrer_id=current_user.id, referred_id=current_user.id, code=code)
    db.add(referral)
    db.commit()
    return ReferralCodeResponse(code=code)

@router.get("/my-code", response_model=ReferralCodeResponse)
def get_my_code(db: DbSession, current_user: CurrentUser):
    referral = db.scalar(select(Referral).where(Referral.referrer_id == current_user.id))
    if not referral:
        raise HTTPException(status_code=404, detail="No referral code generated yet")
    return ReferralCodeResponse(code=referral.code)

@router.get("/my-referrals", response_model=list[ReferralRead])
def my_referrals(db: DbSession, current_user: CurrentUser):
    stmt = select(Referral).where(Referral.referrer_id == current_user.id, Referral.referred_id != current_user.id)
    return list(db.scalars(stmt).all())

@router.post("/claim", response_model=ReferralRead)
def claim_referral(payload: ReferralClaim, db: DbSession, current_user: CurrentUser):
    code_holder = db.scalar(select(Referral).where(Referral.code == payload.code))
    if not code_holder:
        raise HTTPException(status_code=404, detail="Invalid referral code")
    referred_user = db.get(User, payload.referred_id)
    if not referred_user:
        raise HTTPException(status_code=404, detail="Referred user not found")
    existing = db.scalar(select(Referral).where(Referral.referred_id == payload.referred_id))
    if existing:
        raise HTTPException(status_code=400, detail="User already referred")
    referral = Referral(
        referrer_id=code_holder.referrer_id,
        referred_id=payload.referred_id,
        code=payload.code,
    )
    db.add(referral)
    db.commit()
    db.refresh(referral)
    return referral
