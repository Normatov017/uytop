from datetime import datetime

from pydantic import BaseModel


class ChatMessageRead(BaseModel):
    id: int
    sender_id: int
    sender_name: str = ""
    content: str
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatConversationRead(BaseModel):
    id: int
    property_id: int
    property_title: str = ""
    buyer_id: int
    seller_id: int
    other_name: str = ""
    last_message: str | None = None
    last_message_at: datetime | None = None
    unread_count: int = 0
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatConversationCreate(BaseModel):
    property_id: int
    seller_id: int


class ChatMessageCreate(BaseModel):
    content: str
