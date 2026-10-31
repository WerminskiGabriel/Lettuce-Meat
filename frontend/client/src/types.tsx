export type AvailabilityStatus = "preferred" | "canDo";
export type MeetingStatus = "open" | "closed";

export interface CreateMeetingDTO {
  title: string;
  timezone: string;
  date_start: string;
  date_end: string;
  day_start_minute: number;
  day_end_minute: number;
  slot_minutes: number;
  status: MeetingStatus;
  creation_date: string;
  admin_id: string;
}

export interface AvailabilitySlotDTO {
  participant_id?: string;
  on_date: string;
  start_minute: number;
  availability: AvailabilityStatus;
}

export interface EditAvailabilitySlotDTO {
  participant_id: string | null;
  display_name: string;
  slots: AvailabilitySlotDTO[];
}

export interface MeetingData {
  id: string;
  title: string;
  timezone: string;
  date_start: string;
  date_end: string;
  day_start_minute: number;
  day_end_minute: number;
  slot_minutes: number;
  status: MeetingStatus;
  creation_date: string;
  admin_id: string | null;
}

export interface ParticipantData {
  id: string;
  meeting_id: string;
  display_name: string;
}

export interface GetMeetingResponse {
  meeting: MeetingData;
  participants: ParticipantData[];
  slots: AvailabilitySlotDTO[];
  slots_mine?: AvailabilitySlotDTO[];
}

export interface DayColumn {
  iso: string;
  shortDay: string;
  dayNum: string;
  monthShort: string;
}

export interface CellStats {
  count: number;
  preferredCount: number;
  mine: AvailabilityStatus | null;
  voters: { name: string; status: AvailabilityStatus }[];
}
