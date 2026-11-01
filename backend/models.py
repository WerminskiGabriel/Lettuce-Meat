from dataclasses import dataclass

from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, TIMESTAMP, ForeignKey
from db import DB
import uuid
from enum import StrEnum
from datetime import date, datetime, time, UTC


class MeetingStatus(StrEnum):
    OPEN = "open"
    CLOSED = "closed"


@dataclass
class Meeting(DB.db.Model):
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, nullable=False, unique=True,
                                          default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(32))
    timezone: Mapped[str] = mapped_column(String(6))
    quick_description: Mapped[str | None] = mapped_column(String(64))
    date_start: Mapped[date | None] = mapped_column()
    date_end: Mapped[date | None] = mapped_column()
    day_start_minute: Mapped[int | None] = mapped_column()
    day_end_minute: Mapped[int | None] = mapped_column()
    slot_minutes: Mapped[int] = mapped_column()
    status: Mapped[MeetingStatus] = mapped_column(default=MeetingStatus.OPEN)
    creation_date: Mapped[datetime] = mapped_column(default=datetime.now(UTC))
    admin_id: Mapped[uuid.UUID | None] = mapped_column()


@dataclass
class Participant(DB.db.Model):
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, nullable=False, unique=True,
                                          default=uuid.uuid4)
    meeting_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("meeting.id"))
    display_name: Mapped[str] = mapped_column(String(50))
    edit_token_hash: Mapped[str] = mapped_column()


class AvailabilityStatus(StrEnum):
    PREFERRED = "preferred"
    CANDO = "canDo"


@dataclass
class AvailabilitySlot(DB.db.Model):
    participant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("participant.id"), primary_key=True, nullable=False)
    on_date: Mapped[date] = mapped_column(primary_key=True)
    start_minute: Mapped[int] = mapped_column(primary_key=True)
    availability: Mapped[AvailabilityStatus] = mapped_column(nullable=False, default=AvailabilityStatus.CANDO)
