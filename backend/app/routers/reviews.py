from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.review import NeighborhoodReview
from app.schemas.review import DistrictRatingRead, NeighborhoodReviewCreate, NeighborhoodReviewRead

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.get("/district/{district}", response_model=DistrictRatingRead)
def district_rating(district: str, db: Session = Depends(get_db)):
    rows = db.query(NeighborhoodReview).filter(NeighborhoodReview.district == district).all()
    if not rows:
        return DistrictRatingRead(district=district)
    n = len(rows)
    avg_s = sum(r.safety_rating for r in rows) / n
    avg_i = sum(r.infrastructure_rating for r in rows) / n
    avg_t = sum(r.transport_rating for r in rows) / n
    return DistrictRatingRead(
        district=district,
        avg_safety=round(avg_s, 1),
        avg_infrastructure=round(avg_i, 1),
        avg_transport=round(avg_t, 1),
        avg_overall=round((avg_s + avg_i + avg_t) / 3, 1),
        review_count=n,
    )


@router.get("/property/{property_id}", response_model=list[NeighborhoodReviewRead])
def property_reviews(property_id: int, db: Session = Depends(get_db)):
    rows = db.query(NeighborhoodReview).filter(NeighborhoodReview.property_id == property_id).all()
    return [
        NeighborhoodReviewRead(
            id=r.id, property_id=r.property_id, user_id=r.user_id,
            user_name=r.user.full_name if r.user else "",
            district=r.district, safety_rating=r.safety_rating,
            infrastructure_rating=r.infrastructure_rating,
            transport_rating=r.transport_rating, comment=r.comment,
            created_at=r.created_at,
        )
        for r in rows
    ]


@router.post("/property/{property_id}", response_model=NeighborhoodReviewRead, status_code=201)
def create_review(
    property_id: int,
    body: NeighborhoodReviewCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    from app.models.property import Property
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        from fastapi import HTTPException
        raise HTTPException(404, "Property not found")
    review = NeighborhoodReview(
        property_id=property_id,
        user_id=user.id,
        district=prop.district,
        safety_rating=body.safety_rating,
        infrastructure_rating=body.infrastructure_rating,
        transport_rating=body.transport_rating,
        comment=body.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return NeighborhoodReviewRead(
        id=review.id, property_id=review.property_id,
        user_id=review.user_id, user_name=user.full_name,
        district=review.district,
        safety_rating=review.safety_rating,
        infrastructure_rating=review.infrastructure_rating,
        transport_rating=review.transport_rating,
        comment=review.comment, created_at=review.created_at,
    )
