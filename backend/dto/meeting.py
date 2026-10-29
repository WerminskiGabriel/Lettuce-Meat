from datetime import date, time, datetime
from pydantic import BaseModel, Field, model_validator, ValidationError
import uuid
from models import MeetingStatus


class CreateMeetingDTO(BaseModel):
    title: str = Field(min_length=0, max_length=50)
    timezone: str = Field(min_length=5, max_length=5)
    date_start: date
    date_end: date = Field()
    day_start_minute: int = Field(ge=0, le=1440)
    day_end_minute: int = Field(ge=0, le=1440)
    slot_minutes: int
    status: MeetingStatus
    creation_date: date
    admin_id: uuid.UUID

    @model_validator(mode="after")
    def check_validity(self):
        if self.date_start > self.date_end:
            raise ValueError("date_end has to be greater than date_start")
        if self.day_start_minute > self.day_end_minute:
            raise ValueError("day_end_minute has to be greater than day_start_minute")
        if (24 * 60) % self.slot_minutes != 0:
            raise ValueError("slot_minutes has to evenly divide 1440(24*60)")
        return self


"""
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
"""
