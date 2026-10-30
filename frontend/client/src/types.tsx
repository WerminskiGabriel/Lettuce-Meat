export type AvailabilityStatus = "preferred" | "canDo";
export type MeetingStatus = "open" | "closed";

export interface CreateMeetingDTO {
    title: string;// Field(min_length=0, max_length=50)
    timezone: string;// Field(min_length=5, max_length=5)
    date_start: string;
    date_end: string; //date
    day_start_minute: number;// Field(ge=0, le=1440)
    day_end_minute: number;// Field(ge=0, le=1440)
    slot_minutes: number;
    status: MeetingStatus;
    creation_date: string; //date
    admin_id: string; //uuid
}


export interface  AvailabilitySlotDTO {
    on_date: string; //date
    start_minute: number // Field(ge = 0, le = 1440)
    availability: AvailabilityStatus
}

export interface  EditAvailabilitySlotDTO {
    participant_id: string | null; //uuid.UUID | None
    display_name: string; //Field(min_length = 1, max_length = 20)
    slots: AvailabilitySlotDTO[]; // list()
}