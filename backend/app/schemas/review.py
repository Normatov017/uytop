from datetime import datetime

from pydantic import BaseModel


class NeighborhoodReviewRead(BaseModel):
    id: int
    property_id: int
    user_id: int
    user_name: str = ""
    district: str
    safety_rating: int
    infrastructure_rating: int
    transport_rating: int
    comment: str
    created_at: datetime

    model_config = {"from_attributes": True}


class NeighborhoodReviewCreate(BaseModel):
    safety_rating: int
    infrastructure_rating: int
    transport_rating: int
    comment: str = ""


class DistrictRatingRead(BaseModel):
    district: str
    avg_safety: float = 0
    avg_infrastructure: float = 0
    avg_transport: float = 0
    avg_overall: float = 0
    review_count: int = 0
