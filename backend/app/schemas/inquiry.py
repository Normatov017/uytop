from pydantic import BaseModel


class InquiryCreate(BaseModel):
    property_id: int
    full_name: str
    phone: str
    message: str = ""


class InquiryRead(InquiryCreate):
    id: int
    user_id: int | None

    model_config = {"from_attributes": True}
