import type {DayColumn} from "../types.tsx";

const SHORT_DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const SHORT_MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export function timeToMinutes(time: string): number {
    const normalized = time.trim().replace("-", ":");
    const [hoursRaw, minutesRaw] = normalized.split(":");
    const hours = parseInt(hoursRaw, 10);
    const minutes = parseInt(minutesRaw, 10);
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
        return NaN;
    }
    return hours * 60 + minutes;
}

export function minutesToTime(m: number): string {
    const hours = String(Math.floor(m / 60));
    const minutes = String(m % 60).padStart(2, "0");
    return `${hours}:${minutes}`;
}

// Normalizes "yyyy-mm-dd" or Flask's"month, dd mm yy 00:00:00 UTC into "yyyy-mm-dd"
export function normalizeFlaskDate(raw: string): string {
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        return raw;
    }
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) {
        const yy = parsed.getUTCFullYear();
        const mm = String(parsed.getUTCMonth() + 1).padStart(2, "0");
        const dd = String(parsed.getUTCDate()).padStart(2, "0");
        return `${yy}-${mm}-${dd}`;
    }
    return raw.slice(0, 10);
}

export function generateDaysList(dateStartRaw: string, dateEndRaw: string): DayColumn[] {
    const startIso = normalizeFlaskDate(dateStartRaw);
    const endIso = normalizeFlaskDate(dateEndRaw);

    const cur = new Date(`${startIso}T00:00:00Z`);
    const end = new Date(`${endIso}T00:00:00Z`);

    const days: DayColumn[] = [];
    let safety = 0;

    while (cur <= end && safety < 31) {
        const y = cur.getUTCFullYear();
        const mIdx = cur.getUTCMonth();
        const dNum = cur.getUTCDate();
        const wIdx = cur.getUTCDay();

        const iso = `${y}-${String(mIdx + 1).padStart(2, "0")}-${String(dNum).padStart(2, "0")}`;
        days.push({
            iso,
            shortDay: SHORT_DAYS[wIdx],
            dayNum: String(dNum).padStart(2, "0"),
            monthShort: SHORT_MONTHS[mIdx],
        });

        cur.setUTCDate(cur.getUTCDate() + 1);
        safety += 1;
    }

    return days;
}

export function generateMinutesList(
    dayStartMinute: number,
    dayEndMinute: number,
    slotMinutes: number
): number[] {
    const step = slotMinutes > 0 ? slotMinutes : 30;
    const result: number[] = [];
    for (let m = dayStartMinute; m < dayEndMinute; m += step) {
        result.push(m);
    }
    return result;
}
