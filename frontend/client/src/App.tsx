import {useState} from "react";
import {createMeeting, getMeeting, editMeetingAvailability, deleteMeetingAvailability} from "./api/client.ts";
import type {CreateMeetingDTO, EditAvailabilitySlotDTO} from "./types.tsx";

export default function App() {
    const [meetingId, meetingIdSetter] = useState<string>("");
    const [token, tokenSetter] = useState<string>("");
    const [output, outputSetter] = useState(null);

    const sampleSlots: EditAvailabilitySlotDTO = {
        participant_id: null,
        display_name: "charlie-kirk",
        slots: [
            {on_date: "2026-10-28", start_minute: 480, availability: "preferred"},
            {on_date: "2026-10-28", start_minute: 930, availability: "canDo"},
        ],
    };

    async function handleCreate() {
        const dto: CreateMeetingDTO = {
            title: "bit-meeting-kawka",
            timezone: "UTC+1",
            date_start: "2026-10-28",
            date_end: "2026-10-30",
            day_start_minute: 480, // 8
            day_end_minute: 960, // 16
            slot_minutes: 30,
            status: "open",
            creation_date: "2026-10-28",
            admin_id: crypto.randomUUID(),
        };
        const res = await createMeeting(dto);
        if (res.id) {
            meetingIdSetter(res.id);
        }
        outputSetter(res);
    }

    async function handleGet() {
        const res = await getMeeting(meetingId, token || undefined);
        outputSetter(res);
    }

    async function handlePut() {
        const res = await editMeetingAvailability(
            meetingId,
            sampleSlots,
            token || undefined
        );
        if (res.edit_token) {
            tokenSetter(res.edit_token);
        }
        outputSetter(res);
    }

    async function handleDelete() {
        const res = await deleteMeetingAvailability(meetingId, sampleSlots, token);
        outputSetter(res);
    }

    return (
        <div>
            <p>meeting id: {meetingId || "(none)"}</p>
            <p>edit token: {token || "(none)"}</p>

            <button onClick={handleCreate}> POST Create Meeting</button>
            <button onClick={handleGet}> GET Meeting</button>
            <button onClick={handlePut}> PUT Availability</button>
            <button onClick={handleDelete}>DELETE Availability</button>

            <pre>{JSON.stringify(output, null, 2)}</pre>
        </div>
    );
}