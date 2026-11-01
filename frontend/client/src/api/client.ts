import type {CreateMeetingDTO, EditAvailabilitySlotDTO} from "../types.tsx";

export async function createMeeting(meetingDTO: CreateMeetingDTO) {
    const response = await fetch("/api/meetings",
        {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(meetingDTO),
        });
    return await response.json();
}

export async function getMeeting(meetingId: string, token?: string) {


    const response = await fetch(`/api/meetings/${meetingId}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...(token ? {"X-Edit-Token": token} : {})
            }

        });

    return await response.json();
}

export async function editMeetingAvailability(meetingId: string, slotsDTO: EditAvailabilitySlotDTO, token?: string) {
    const response = await fetch(`/api/meetings/${meetingId}/availability`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...(token ? {"X-Edit-Token": token} : {})
            },
            body: JSON.stringify(slotsDTO),
        });
    return await response.json();
}

export async function deleteMeetingAvailability(meetingId: string, slotsDTO: EditAvailabilitySlotDTO, token?: string) {
    const response = await fetch(`/api/meetings/${meetingId}/availability/`,
        {
            method: "DELETE",
           headers: {
                "Content-Type": "application/json",
                ...(token ? {"X-Edit-Token": token} : {})
            },
            body: JSON.stringify(slotsDTO),
        });

    return await response.json();
}