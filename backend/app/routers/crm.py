from datetime import datetime

from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import select

from app.core.deps import CurrentUser, DbSession
from app.models.crm import Appointment, AppointmentStatus, Client, CrmNote, Payment, PaymentStatus

router = APIRouter(prefix="/crm", tags=["crm"])


# ─── Schemas ──────────────────────────────────────────────────────────────────

class ClientCreate(BaseModel):
    full_name: str
    phone: str
    email: str | None = None
    notes: str | None = None
    budget_min: float | None = None
    budget_max: float | None = None
    preferred_districts: str | None = None
    property_type_pref: str | None = None
    source: str | None = None
    status: str = "active"

class ClientRead(ClientCreate):
    id: int
    agent_id: int
    created_at: datetime
    model_config = {"from_attributes": True}

class ClientUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    email: str | None = None
    notes: str | None = None
    budget_min: float | None = None
    budget_max: float | None = None
    preferred_districts: str | None = None
    property_type_pref: str | None = None
    source: str | None = None
    status: str | None = None

class AppointmentCreate(BaseModel):
    client_id: int
    property_id: int | None = None
    title: str
    scheduled_at: datetime
    duration_minutes: int = 30
    status: AppointmentStatus = AppointmentStatus.scheduled
    notes: str | None = None

class AppointmentRead(AppointmentCreate):
    id: int
    agent_id: int
    created_at: datetime
    model_config = {"from_attributes": True}

class AppointmentUpdate(BaseModel):
    title: str | None = None
    scheduled_at: datetime | None = None
    duration_minutes: int | None = None
    status: AppointmentStatus | None = None
    notes: str | None = None

class CrmNoteCreate(BaseModel):
    client_id: int | None = None
    content: str

class CrmNoteRead(CrmNoteCreate):
    id: int
    agent_id: int
    created_at: datetime
    model_config = {"from_attributes": True}

class PaymentCreate(BaseModel):
    client_id: int
    property_id: int | None = None
    amount: float
    currency: str = "USD"
    payment_type: str
    status: PaymentStatus = PaymentStatus.pending
    description: str | None = None
    paid_at: datetime | None = None

class PaymentRead(PaymentCreate):
    id: int
    agent_id: int
    created_at: datetime
    model_config = {"from_attributes": True}


# ─── Clients ──────────────────────────────────────────────────────────────────

@router.get("/clients", response_model=list[ClientRead])
def list_clients(db: DbSession, current_user: CurrentUser):
    return list(db.scalars(select(Client).where(Client.agent_id == current_user.id).order_by(Client.created_at.desc())).all())

@router.post("/clients", response_model=ClientRead, status_code=status.HTTP_201_CREATED)
def create_client(payload: ClientCreate, db: DbSession, current_user: CurrentUser):
    client = Client(agent_id=current_user.id, **payload.model_dump())
    db.add(client)
    db.commit()
    db.refresh(client)
    return client

@router.get("/clients/{client_id}", response_model=ClientRead)
def get_client(client_id: int, db: DbSession, current_user: CurrentUser):
    client = db.scalar(select(Client).where(Client.id == client_id, Client.agent_id == current_user.id))
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

@router.put("/clients/{client_id}", response_model=ClientRead)
def update_client(client_id: int, payload: ClientUpdate, db: DbSession, current_user: CurrentUser):
    client = db.scalar(select(Client).where(Client.id == client_id, Client.agent_id == current_user.id))
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(client, key, value)
    db.commit()
    db.refresh(client)
    return client

@router.delete("/clients/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_client(client_id: int, db: DbSession, current_user: CurrentUser):
    client = db.scalar(select(Client).where(Client.id == client_id, Client.agent_id == current_user.id))
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    db.delete(client)
    db.commit()


# ─── Appointments ─────────────────────────────────────────────────────────────

@router.get("/appointments", response_model=list[AppointmentRead])
def list_appointments(db: DbSession, current_user: CurrentUser):
    return list(db.scalars(select(Appointment).where(Appointment.agent_id == current_user.id).order_by(Appointment.scheduled_at.desc())).all())

@router.post("/appointments", response_model=AppointmentRead, status_code=status.HTTP_201_CREATED)
def create_appointment(payload: AppointmentCreate, db: DbSession, current_user: CurrentUser):
    client = db.get(Client, payload.client_id)
    if not client or client.agent_id != current_user.id:
        raise HTTPException(status_code=404, detail="Client not found")
    appointment = Appointment(agent_id=current_user.id, **payload.model_dump())
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment

@router.get("/appointments/{appointment_id}", response_model=AppointmentRead)
def get_appointment(appointment_id: int, db: DbSession, current_user: CurrentUser):
    appointment = db.scalar(select(Appointment).where(Appointment.id == appointment_id, Appointment.agent_id == current_user.id))
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment

@router.put("/appointments/{appointment_id}", response_model=AppointmentRead)
def update_appointment(appointment_id: int, payload: AppointmentUpdate, db: DbSession, current_user: CurrentUser):
    appointment = db.scalar(select(Appointment).where(Appointment.id == appointment_id, Appointment.agent_id == current_user.id))
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(appointment, key, value)
    db.commit()
    db.refresh(appointment)
    return appointment

@router.delete("/appointments/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_appointment(appointment_id: int, db: DbSession, current_user: CurrentUser):
    appointment = db.scalar(select(Appointment).where(Appointment.id == appointment_id, Appointment.agent_id == current_user.id))
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    db.delete(appointment)
    db.commit()


# ─── Notes ────────────────────────────────────────────────────────────────────

@router.get("/clients/{client_id}/notes", response_model=list[CrmNoteRead])
def list_client_notes(client_id: int, db: DbSession, current_user: CurrentUser):
    client = db.scalar(select(Client).where(Client.id == client_id, Client.agent_id == current_user.id))
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return list(db.scalars(select(CrmNote).where(CrmNote.client_id == client_id).order_by(CrmNote.created_at.desc())).all())

@router.post("/clients/{client_id}/notes", response_model=CrmNoteRead, status_code=status.HTTP_201_CREATED)
def create_client_note(client_id: int, payload: CrmNoteCreate, db: DbSession, current_user: CurrentUser):
    client = db.scalar(select(Client).where(Client.id == client_id, Client.agent_id == current_user.id))
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    note = CrmNote(agent_id=current_user.id, client_id=client_id, content=payload.content)
    db.add(note)
    db.commit()
    db.refresh(note)
    return note

@router.delete("/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(note_id: int, db: DbSession, current_user: CurrentUser):
    note = db.scalar(select(CrmNote).where(CrmNote.id == note_id, CrmNote.agent_id == current_user.id))
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(note)
    db.commit()


# ─── Payments ─────────────────────────────────────────────────────────────────

@router.get("/payments", response_model=list[PaymentRead])
def list_payments(db: DbSession, current_user: CurrentUser):
    return list(db.scalars(select(Payment).where(Payment.agent_id == current_user.id).order_by(Payment.created_at.desc())).all())

@router.post("/payments", response_model=PaymentRead, status_code=status.HTTP_201_CREATED)
def create_payment(payload: PaymentCreate, db: DbSession, current_user: CurrentUser):
    client = db.get(Client, payload.client_id)
    if not client or client.agent_id != current_user.id:
        raise HTTPException(status_code=404, detail="Client not found")
    payment = Payment(agent_id=current_user.id, **payload.model_dump())
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment

@router.get("/payments/{payment_id}", response_model=PaymentRead)
def get_payment(payment_id: int, db: DbSession, current_user: CurrentUser):
    payment = db.scalar(select(Payment).where(Payment.id == payment_id, Payment.agent_id == current_user.id))
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment
