import asyncio

from fastapi import APIRouter, Depends
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.chat import ChatConversation, ChatMessage
from app.schemas.chat import (
    ChatConversationCreate,
    ChatConversationRead,
    ChatMessageCreate,
    ChatMessageRead,
)
from app.services.websocket_manager import connection_manager

router = APIRouter(prefix="/chat", tags=["chat"])


@router.get("/conversations", response_model=list[ChatConversationRead])
def list_conversations(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    convos = (
        db.query(ChatConversation)
        .filter(or_(ChatConversation.buyer_id == user.id, ChatConversation.seller_id == user.id))
        .order_by(ChatConversation.last_message_at.desc().nullslast())
        .all()
    )
    result = []
    for c in convos:
        unread = (
            db.query(ChatMessage)
            .filter(
                ChatMessage.conversation_id == c.id,
                ChatMessage.sender_id != user.id,
                ChatMessage.is_read == False,
            )
            .count()
        )
        other_name = c.seller.full_name if c.buyer_id == user.id else c.buyer.full_name
        result.append(ChatConversationRead(
            id=c.id,
            property_id=c.property_id,
            property_title=c.property.title if c.property else "",
            buyer_id=c.buyer_id,
            seller_id=c.seller_id,
            other_name=other_name,
            last_message=c.last_message,
            last_message_at=c.last_message_at,
            unread_count=unread,
            created_at=c.created_at,
        ))
    return result


@router.post("/conversations", response_model=ChatConversationRead, status_code=201)
def create_conversation(
    body: ChatConversationCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    existing = (
        db.query(ChatConversation)
        .filter(
            ChatConversation.property_id == body.property_id,
            ChatConversation.buyer_id == user.id,
            ChatConversation.seller_id == body.seller_id,
        )
        .first()
    )
    if existing:
        return _conv_to_read(existing, db, user)
    conv = ChatConversation(property_id=body.property_id, buyer_id=user.id, seller_id=body.seller_id)
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return _conv_to_read(conv, db, user)


@router.get("/conversations/{conv_id}/messages", response_model=list[ChatMessageRead])
def list_messages(
    conv_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    conv = db.query(ChatConversation).filter(ChatConversation.id == conv_id).first()
    if not conv:
        return []
    if conv.buyer_id != user.id and conv.seller_id != user.id:
        return []
    # mark as read
    db.query(ChatMessage).filter(
        ChatMessage.conversation_id == conv_id,
        ChatMessage.sender_id != user.id,
        ChatMessage.is_read == False,
    ).update({"is_read": True})
    db.commit()
    msgs = db.query(ChatMessage).filter(ChatMessage.conversation_id == conv_id).order_by(ChatMessage.created_at).all()
    return [
        ChatMessageRead(
            id=m.id,
            sender_id=m.sender_id,
            sender_name=m.sender.full_name if m.sender else "",
            content=m.content,
            is_read=m.is_read,
            created_at=m.created_at,
        )
        for m in msgs
    ]


@router.post("/conversations/{conv_id}/messages", response_model=ChatMessageRead, status_code=201)
def send_message(
    conv_id: int,
    body: ChatMessageCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    conv = db.query(ChatConversation).filter(ChatConversation.id == conv_id).first()
    if not conv:
        from fastapi import HTTPException
        raise HTTPException(404, "Conversation not found")
    if conv.buyer_id != user.id and conv.seller_id != user.id:
        from fastapi import HTTPException
        raise HTTPException(403, "Not a participant")
    msg = ChatMessage(conversation_id=conv_id, sender_id=user.id, content=body.content)
    conv.last_message = body.content
    conv.last_message_at = msg.created_at
    db.add(msg)
    db.commit()
    db.refresh(msg)

    recipient_id = conv.seller_id if user.id == conv.buyer_id else conv.buyer_id
    asyncio.get_event_loop().create_task(
        connection_manager.send_to_user(recipient_id, {
            "type": "new_message",
            "conversation_id": conv_id,
            "message": {
                "id": msg.id,
                "sender_id": msg.sender_id,
                "sender_name": user.full_name,
                "content": msg.content,
                "is_read": msg.is_read,
                "created_at": msg.created_at.isoformat(),
            },
        })
    )

    return ChatMessageRead(
        id=msg.id, sender_id=msg.sender_id,
        sender_name=user.full_name, content=msg.content,
        is_read=msg.is_read, created_at=msg.created_at,
    )


@router.get("/unread-count")
def unread_count(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    convos = (
        db.query(ChatConversation)
        .filter(or_(ChatConversation.buyer_id == user.id, ChatConversation.seller_id == user.id))
        .all()
    )
    total = 0
    for c in convos:
        total += db.query(ChatMessage).filter(
            ChatMessage.conversation_id == c.id,
            ChatMessage.sender_id != user.id,
            ChatMessage.is_read == False,
        ).count()
    return {"unread": total}


def _conv_to_read(c: ChatConversation, db: Session, user):
    unread = db.query(ChatMessage).filter(
        ChatMessage.conversation_id == c.id,
        ChatMessage.sender_id != user.id,
        ChatMessage.is_read == False,
    ).count()
    other_name = c.seller.full_name if c.buyer_id == user.id else c.buyer.full_name
    return ChatConversationRead(
        id=c.id, property_id=c.property_id,
        property_title=c.property.title if c.property else "",
        buyer_id=c.buyer_id, seller_id=c.seller_id,
        other_name=other_name,
        last_message=c.last_message, last_message_at=c.last_message_at,
        unread_count=unread, created_at=c.created_at,
    )
