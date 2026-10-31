import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import type {CreateMeetingDTO} from "../types.tsx";
import {createMeeting} from "../api/client.ts";

function timeToMinutes(time: string): number {
    const [hoursRaw, minutesRaw] = time.split(":");
    return parseInt(hoursRaw) * 60 + parseInt(minutesRaw);
}

export default function HomePage() {
    const navigate = useNavigate();
    const [error, setError] = useState<unknown>(null);


    const [formData, setFormData] = useState({
        title: "new Meeting",
        timezone: "UTC+1",
        date_start: "2026-10-28",
        date_end: "2026-10-30",
        start_time: "08:00",
        end_time: "16:00",
        slot_minutes: 30,
    });

    async function handleCreateMeeting(formEvent: React.FormEvent) {
        formEvent.preventDefault();

        const dto: CreateMeetingDTO = {
            title: formData.title,
            timezone: formData.timezone,
            date_start: formData.date_start,
            date_end: formData.date_end,
            day_start_minute: timeToMinutes(formData.start_time),
            day_end_minute: timeToMinutes(formData.end_time),
            slot_minutes: formData.slot_minutes,
            status: "open",
            creation_date: new Date().toISOString().slice(0, 10),
            admin_id: crypto.randomUUID(),
        };

        const res = await createMeeting(dto);
        if (res.id) {
            navigate(`/m/${res.id}`);
            return;
        }

        setError(res);
    }

    return (
        <form onSubmit={handleCreateMeeting}>
            <button type="submit">Test create and navigate</button>
            {Boolean(error) && <pre>{JSON.stringify(error, null, 2)}</pre>}
        </form>
    );
}