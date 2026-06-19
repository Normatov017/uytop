from pydantic import BaseModel

from app.schemas.property import PropertyRead


class FavoriteRead(BaseModel):
    id: int
    property: PropertyRead

    model_config = {"from_attributes": True}
