from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, TIMESTAMP, ForeignKey
from db import DB
import uuid
from enum import StrEnum
from datetime import date, datetime, time, UTC


class MeetingStatus(StrEnum):
    OPEN = "open"
    CLOSED = "closed"


# MappedColumn docs - primary_key=, nullable=, unique=, default=, ForeignKey=, String(),
class Meeting(DB.db.Model):
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, nullable=False, unique=True,
                                          default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(50))
    timezone: Mapped[datetime] = mapped_column(TIMESTAMP, default=datetime.now(UTC))
    date_start: Mapped[date] = mapped_column()
    date_end: Mapped[date] = mapped_column()
    day_start_minute: Mapped[int] = mapped_column()
    day_end_minute: Mapped[int] = mapped_column()
    slot_minutes: Mapped[int] = mapped_column()
    status: Mapped[MeetingStatus] = mapped_column(default=MeetingStatus.OPEN)
    creation_date: Mapped[datetime] = mapped_column()
    admin_id: Mapped[uuid.UUID | None] = mapped_column()


class Participant(DB.db.Model):
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, nullable=False, unique=True,
                                          default=uuid.uuid4)
    meeting_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("meeting.id"))
    display_name: Mapped[str] = mapped_column(String(50))
    edit_token_hash: Mapped[str] = mapped_column()


class AvailabilistyStatus(StrEnum):
    PREFERRED = "preferred"
    CANDO = "canDo"


class AvailabilitySlot(DB.db.Model):
    participant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("participant.id"), primary_key=True, nullable=False)
    on_date: Mapped[date] = mapped_column(primary_key=True)
    start_minute: Mapped[int] = mapped_column(primary_key=True)
    availability: Mapped[AvailabilistyStatus] = mapped_column(nullable=False, default=AvailabilistyStatus.CANDO)
