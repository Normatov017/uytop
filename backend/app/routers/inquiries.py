from fastapi import APIRouter, status

from app.core.deps import DbSession
from app.models.inquiry import Inquiry
from app.schemas.inquiry import InquiryCreate, InquiryRead
from app.services.property_service import get_property_or_404

router = APIRouter(prefix="/inquiries", tags=["inquiries"])


@router.post("", response_model=InquiryRead, status_code=status.HTTP_201_CREATED)
def create_inquiry(payload: InquiryCreate, db: DbSession) -> Inquiry:
    get_property_or_404(db, payload.property_id)
    inquiry = Inquiry(**payload.model_dump())
    db.add(inquiry)
    db.commit()
    db.refresh(inquiry)
    return inquiry
