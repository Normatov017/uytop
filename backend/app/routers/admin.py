from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select

from app.core.deps import DbSession, require_admin
from app.models.building import CompanyProfile
from app.models.property import Property
from app.models.user import User
from app.schemas.admin import AdminStats, ModerationUpdate
from app.schemas.property import PropertyRead
from app.schemas.user import UserRead
from app.services.property_service import get_property_or_404, property_query, update_property
from app.services.stats_service import get_admin_stats

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])


@router.get("/stats", response_model=AdminStats)
def stats(db: DbSession) -> AdminStats:
    return get_admin_stats(db)


@router.get("/properties", response_model=list[PropertyRead])
def properties(db: DbSession) -> list[Property]:
    return list(db.scalars(property_query().order_by(Property.created_at.desc())).all())


@router.patch("/properties/{property_id}", response_model=PropertyRead)
def moderate_property(property_id: int, payload: ModerationUpdate, db: DbSession) -> Property:
    prop = get_property_or_404(db, property_id)
    return update_property(db, prop, payload)  # type: ignore[arg-type]


@router.get("/users", response_model=list[UserRead])
def users(db: DbSession) -> list[User]:
    return list(db.scalars(select(User).order_by(User.created_at.desc())).all())


# ── Company verification ──────────────────────────────────────

@router.get("/companies")
def list_companies(db: DbSession) -> list[dict]:
    profiles = db.execute(
        select(CompanyProfile, User).join(User, CompanyProfile.user_id == User.id)
        .order_by(CompanyProfile.created_at.desc())
    ).all()
    return [
        {
            "id": cp.id,
            "user_id": cp.user_id,
            "user_name": user.full_name,
            "user_phone": user.phone,
            "company_name": cp.company_name,
            "license_number": cp.license_number,
            "company_phone": cp.company_phone,
            "company_address": cp.company_address,
            "company_description": cp.company_description,
            "logo_url": cp.logo_url,
            "documents": cp.documents,
            "is_verified": cp.is_verified,
            "created_at": cp.created_at.isoformat() if cp.created_at else "",
        }
        for cp, user in profiles
    ]


@router.post("/companies/{company_id}/verify")
def verify_company(company_id: int, db: DbSession) -> dict:
    profile = db.get(CompanyProfile, company_id)
    if not profile:
        raise HTTPException(404, "Company not found")
    profile.is_verified = True
    db.commit()
    return {"ok": True, "message": "Kompaniya tasdiqlandi"}


@router.post("/companies/{company_id}/unverify")
def unverify_company(company_id: int, db: DbSession) -> dict:
    profile = db.get(CompanyProfile, company_id)
    if not profile:
        raise HTTPException(404, "Company not found")
    profile.is_verified = False
    db.commit()
    return {"ok": True, "message": "Tasdiqlash bekor qilindi"}
