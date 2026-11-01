from datetime import date, time, datetime
from pydantic import BaseModel, Field, model_validator, ValidationError
import uuid
from models import MeetingStatus, AvailabilityStatus

MIN_MEETING_YEAR = 2000
MAX_MEETING_YEAR = 2099


def assert_meeting_calendar_date(value: date, field_name: str) -> None:
    if value.year < MIN_MEETING_YEAR or value.year > MAX_MEETING_YEAR:
        raise ValueError(
            f"{field_name} must use a year between {MIN_MEETING_YEAR} and {MAX_MEETING_YEAR}"
        )


class CreateMeetingDTO(BaseModel):
    title: str = Field(min_length=1, max_length=32)
    timezone: str = Field(min_length=5, max_length=6)
    quick_description: str | None = Field(max_length=64)
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
        assert_meeting_calendar_date(self.date_start, "date_start")
        assert_meeting_calendar_date(self.date_end, "date_end")
        assert_meeting_calendar_date(self.creation_date, "creation_date")
        if self.date_start > self.date_end:
            raise ValueError("date_end has to be greater than date_start")
        if self.day_start_minute >= self.day_end_minute:
            raise ValueError("day_end_minute has to be greater than day_start_minute")
        if (self.day_end_minute - self.day_start_minute) % self.slot_minutes != 0:
            raise ValueError("slot_minutes must evenly divide the daily time window")
        return self


class AvailabilitySlotDTO(BaseModel):
    on_date: date
    start_minute: int = Field(ge=0, le=1440)
    availability: AvailabilityStatus


class EditAvailabilitySlotDTO(BaseModel):
    participant_id: uuid.UUID | None = None
    display_name: str = Field(min_length=1, max_length=20)
    slots: list[AvailabilitySlotDTO]
