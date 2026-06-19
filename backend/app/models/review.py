from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class NeighborhoodReview(Base):
    __tablename__ = "neighborhood_reviews"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    property_id: Mapped[int] = mapped_column(ForeignKey("properties.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    district: Mapped[str] = mapped_column(String(120), index=True)
    safety_rating: Mapped[int] = mapped_column(Integer)
    infrastructure_rating: Mapped[int] = mapped_column(Integer)
    transport_rating: Mapped[int] = mapped_column(Integer)
    comment: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    property = relationship("Property")
    user = relationship("User")
