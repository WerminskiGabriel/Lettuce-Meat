const HOURS = Array.from({length: 24}, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({length: 60}, (_, i) => String(i).padStart(2, "0"));

function parseTime24(value: string): [string, string] {
    const normalized = value.trim().replace("-", ":");
    const match = /^(\d{1,2}):(\d{2})$/.exec(normalized);
    if (!match) return ["08", "00"];
    const h = Math.min(23, Math.max(0, parseInt(match[1], 10)));
    const m = Math.min(59, Math.max(0, parseInt(match[2], 10)));
    return [String(h).padStart(2, "0"), String(m).padStart(2, "0")];
}

interface TimeInput24Props {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export default function TimeInput24({value, onChange, className = ""}: TimeInput24Props) {
    const [hour, minute] = parseTime24(value);

    function emit(h: string, m: string) {
        onChange(`${h}:${m}`);
    }

    const selectClass =
        "flex-1 min-w-0 bg-white border-2 border-black px-2 py-2 text-xs font-mono font-bold text-black focus:outline-none focus:border-brand-orange appearance-none text-center";

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            <select
                aria-label="Hour 24h"
                value={hour}
                onChange={(e) => emit(e.target.value, minute)}
                className={selectClass}
            >
                {HOURS.map((h) => (
                    <option key={h} value={h}>
                        {h}
                    </option>
                ))}
            </select>
            <span className="font-mono font-bold text-black px-0.5">:</span>
            <select
                aria-label="Minute"
                value={minute}
                onChange={(e) => emit(hour, e.target.value)}
                className={selectClass}
            >
                {MINUTES.map((m) => (
                    <option key={m} value={m}>
                        {m}
                    </option>
                ))}
            </select>
        </div>
    );
}
