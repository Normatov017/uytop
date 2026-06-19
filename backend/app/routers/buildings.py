from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_admin
from app.models.building import ApartmentStatus, ApartmentUnit, Building, BuildingStatus, CompanyProfile
from app.models.user import User

router = APIRouter(prefix="/buildings", tags=["buildings"])


class CompanyProfileCreate(BaseModel):
    company_name: str
    license_number: str
    company_phone: str
    company_address: str = ""
    company_description: str = ""
    logo_url: str | None = None
    documents: list[str] = []


class ApartmentUnitCreate(BaseModel):
    floor: int
    number: str
    rooms: int
    area_m2: float
    price: float
    plan_image: str | None = None


class BuildingCreate(BaseModel):
    name: str
    description: str = ""
    district: str
    city: str = "Toshkent"
    address: str = ""
    latitude: float | None = None
    longitude: float | None = None
    total_floors: int = 1
    total_apartments: int = 0
    property_type: str = "apartment"
    building_material: str | None = None
    parking_type: str | None = None
    elevator_count: int | None = None
    images: list[str] = []
    amenities: list[str] = []
    completion_date: str | None = None


# ── Company Profile ──────────────────────────────────────────

@router.get("/company")
def my_company(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    profile = db.query(CompanyProfile).filter(CompanyProfile.user_id == user.id).first()
    if not profile:
        return None
    return {
        "id": profile.id,
        "company_name": profile.company_name,
        "license_number": profile.license_number,
        "company_phone": profile.company_phone,
        "company_address": profile.company_address,
        "company_description": profile.company_description,
        "logo_url": profile.logo_url,
        "documents": profile.documents,
        "is_verified": profile.is_verified,
    }


@router.post("/company", status_code=201)
def create_or_update_company(
    body: CompanyProfileCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    profile = db.query(CompanyProfile).filter(CompanyProfile.user_id == user.id).first()
    if profile:
        profile.company_name = body.company_name
        profile.license_number = body.license_number
        profile.company_phone = body.company_phone
        profile.company_address = body.company_address
        profile.company_description = body.company_description
        if body.logo_url is not None:
            profile.logo_url = body.logo_url
        if body.documents:
            profile.documents = body.documents
    else:
        profile = CompanyProfile(
            user_id=user.id,
            company_name=body.company_name,
            license_number=body.license_number,
            company_phone=body.company_phone,
            company_address=body.company_address,
            company_description=body.company_description,
            logo_url=body.logo_url,
            documents=body.documents,
        )
        db.add(profile)
    db.commit()
    db.refresh(profile)
    return {"id": profile.id, "message": "Company profile saved"}


# ── Buildings ────────────────────────────────────────────────

@router.get("/public")
def public_buildings(
    district: str | None = None,
    db: Session = Depends(get_db),
):
    q = db.query(Building).join(CompanyProfile, Building.developer_id == CompanyProfile.user_id, isouter=True)
    if district:
        q = q.filter(Building.district == district)
    buildings = q.order_by(Building.created_at.desc()).all()
    result = []
    for b in buildings:
        profile = db.query(CompanyProfile).filter(CompanyProfile.user_id == b.developer_id).first()
        apartments = db.query(ApartmentUnit).filter(ApartmentUnit.building_id == b.id).all()
        free = [a for a in apartments if a.status == "free"]
        result.append({
            "id": b.id,
            "name": b.name,
            "description": b.description,
            "district": b.district,
            "city": b.city,
            "address": b.address,
            "total_floors": b.total_floors,
            "total_apartments": b.total_apartments,
            "property_type": b.property_type,
            "status": b.status.value,
            "images": b.images,
            "amenities": b.amenities,
            "completion_date": b.completion_date,
            "free_count": len(free),
            "min_price": min((a.price for a in free), default=0),
            "company_verified": profile.is_verified if profile else False,
            "company_name": profile.company_name if profile else "",
            "developer_name": b.developer.full_name if b.developer else "",
        })
    return result


@router.get("/public/{building_id}")
def public_building_detail(building_id: int, db: Session = Depends(get_db)):
    b = db.query(Building).filter(Building.id == building_id).first()
    if not b:
        raise HTTPException(404, "Building not found")
    profile = db.query(CompanyProfile).filter(CompanyProfile.user_id == b.developer_id).first()
    apartments = db.query(ApartmentUnit).filter(ApartmentUnit.building_id == b.id).all()
    return {
        "id": b.id,
        "name": b.name,
        "description": b.description,
        "district": b.district,
        "city": b.city,
        "address": b.address,
        "latitude": b.latitude,
        "longitude": b.longitude,
        "total_floors": b.total_floors,
        "total_apartments": b.total_apartments,
        "property_type": b.property_type,
        "building_material": b.building_material,
        "parking_type": b.parking_type,
        "elevator_count": b.elevator_count,
        "images": b.images,
        "amenities": b.amenities,
        "completion_date": b.completion_date,
        "status": b.status.value,
        "company_verified": profile.is_verified if profile else False,
        "company_name": profile.company_name if profile else "",
        "company_phone": profile.company_phone if profile else "",
        "company_description": profile.company_description if profile else "",
        "logo_url": profile.logo_url if profile else "",
        "developer_name": b.developer.full_name if b.developer else "",
        "apartments": [
            {"id": a.id, "floor": a.floor, "number": a.number, "rooms": a.rooms,
             "area_m2": a.area_m2, "price": a.price, "status": a.status.value}
            for a in apartments if a.status == "free"
        ],
    }


@router.get("", response_model=list[dict])
def list_buildings(
    district: str | None = None,
    status: str | None = None,
    db: Session = Depends(get_db),
):
    q = db.query(Building)
    if district:
        q = q.filter(Building.district == district)
    if status:
        q = q.filter(Building.status == status)
    return _building_list(q.order_by(Building.created_at.desc()).all(), db)


@router.get("/mine", response_model=list[dict])
def my_buildings(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = db.query(Building).filter(Building.developer_id == user.id)
    return _building_list(q.order_by(Building.created_at.desc()).all(), db)


@router.post("", status_code=201)
def create_building(
    body: BuildingCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    building = Building(
        developer_id=user.id,
        name=body.name,
        description=body.description,
        district=body.district,
        city=body.city,
        address=body.address,
        latitude=body.latitude,
        longitude=body.longitude,
        total_floors=body.total_floors,
        total_apartments=body.total_apartments,
        property_type=body.property_type,
        building_material=body.building_material,
        parking_type=body.parking_type,
        elevator_count=body.elevator_count,
        images=body.images,
        amenities=body.amenities,
        completion_date=body.completion_date,
    )
    db.add(building)
    db.commit()
    db.refresh(building)
    return {"id": building.id, "message": "Building created"}


@router.get("/{building_id}", response_model=dict)
def get_building(building_id: int, db: Session = Depends(get_db)):
    building = db.query(Building).filter(Building.id == building_id).first()
    if not building:
        raise HTTPException(404, "Building not found")
    return _building_detail(building, db)


@router.get("/{building_id}/developer")
def get_building_developer(building_id: int, db: Session = Depends(get_db)):
    building = db.query(Building).filter(Building.id == building_id).first()
    if not building:
        raise HTTPException(404, "Building not found")
    profile = db.query(CompanyProfile).filter(CompanyProfile.user_id == building.developer_id).first()
    user = building.developer
    return {
        "developer_id": building.developer_id,
        "developer_name": user.full_name if user else "",
        "company": {
            "company_name": profile.company_name if profile else None,
            "license_number": profile.license_number if profile else None,
            "company_phone": profile.company_phone if profile else None,
            "company_description": profile.company_description if profile else None,
            "logo_url": profile.logo_url if profile else None,
            "documents": profile.documents if profile else [],
            "is_verified": profile.is_verified if profile else False,
        } if profile else None,
    }


# ── Apartments ───────────────────────────────────────────────

@router.post("/{building_id}/apartments", status_code=201)
def add_apartment(
    building_id: int,
    body: ApartmentUnitCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    building = db.query(Building).filter(Building.id == building_id).first()
    if not building or building.developer_id != user.id:
        raise HTTPException(403, "Not your building")
    unit = ApartmentUnit(building_id=building_id, **body.model_dump())
    db.add(unit)
    building.total_apartments = db.query(ApartmentUnit).filter(ApartmentUnit.building_id == building_id).count()
    db.commit()
    db.refresh(unit)
    return {"id": unit.id}


@router.patch("/apartments/{unit_id}/status")
def update_apartment_status(
    unit_id: int,
    status: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    unit = db.query(ApartmentUnit).filter(ApartmentUnit.id == unit_id).first()
    if not unit:
        raise HTTPException(404, "Apartment not found")
    building = db.query(Building).filter(Building.id == unit.building_id).first()
    if not building or building.developer_id != user.id:
        raise HTTPException(403, "Not your building")
    if status not in [s.value for s in ApartmentStatus]:
        raise HTTPException(400, f"Invalid status: {status}")
    unit.status = status
    db.commit()
    return {"ok": True}


# ── Helpers ──────────────────────────────────────────────────

def _building_list(buildings: list[Building], db: Session) -> list[dict]:
    result = []
    for b in buildings:
        apartments = db.query(ApartmentUnit).filter(ApartmentUnit.building_id == b.id).all()
        free = sum(1 for a in apartments if a.status == "free")
        booked = sum(1 for a in apartments if a.status == "booked")
        sold = sum(1 for a in apartments if a.status == "sold")
        result.append({
            "id": b.id, "name": b.name, "district": b.district, "city": b.city,
            "total_floors": b.total_floors, "total_apartments": b.total_apartments,
            "property_type": b.property_type, "status": b.status.value,
            "images": b.images, "completion_date": b.completion_date,
            "created_at": b.created_at.isoformat() if b.created_at else "",
            "free": free, "booked": booked, "sold": sold,
            "apartments": [
                {"id": a.id, "floor": a.floor, "number": a.number, "rooms": a.rooms,
                 "area_m2": a.area_m2, "price": a.price, "status": a.status.value}
                for a in apartments
            ],
        })
    return result


def _building_detail(building: Building, db: Session) -> dict:
    profile = db.query(CompanyProfile).filter(CompanyProfile.user_id == building.developer_id).first()
    apartments = db.query(ApartmentUnit).filter(ApartmentUnit.building_id == building.id).all()
    return {
        "id": building.id, "developer_id": building.developer_id,
        "developer_name": building.developer.full_name if building.developer else "",
        "name": building.name, "description": building.description,
        "district": building.district, "city": building.city, "address": building.address,
        "latitude": building.latitude, "longitude": building.longitude,
        "total_floors": building.total_floors, "total_apartments": building.total_apartments,
        "property_type": building.property_type,
        "building_material": building.building_material,
        "parking_type": building.parking_type,
        "elevator_count": building.elevator_count,
        "images": building.images, "amenities": building.amenities,
        "completion_date": building.completion_date, "status": building.status.value,
        "created_at": building.created_at.isoformat() if building.created_at else "",
        "company": {
            "company_name": profile.company_name if profile else None,
            "license_number": profile.license_number if profile else None,
            "company_phone": profile.company_phone if profile else None,
            "logo_url": profile.logo_url if profile else None,
            "documents": profile.documents if profile else [],
            "is_verified": profile.is_verified if profile else False,
        } if profile else None,
        "apartments": [
            {"id": a.id, "floor": a.floor, "number": a.number, "rooms": a.rooms,
             "area_m2": a.area_m2, "price": a.price, "status": a.status.value, "plan_image": a.plan_image}
            for a in apartments
        ],
    }
