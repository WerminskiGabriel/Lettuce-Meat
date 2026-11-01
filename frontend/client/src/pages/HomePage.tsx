import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import type {CreateMeetingDTO} from "../types.tsx";
import {createMeeting} from "../api/client.ts";
import {timeToMinutes} from "../utils/time.ts";
import Navbar from "../components/Navbar.tsx";
import Footer from "../components/Footer.tsx";

function detectUtcOffset(): string {
    const offsetMin = -new Date().getTimezoneOffset();
    const sign = offsetMin >= 0 ? "+" : "-";
    const abs = Math.abs(offsetMin);
    const hours = Math.floor(abs / 60);
    const mins = abs % 60;
    if (mins === 0) return `UTC${sign}${hours}`;
    return `UTC${sign}${hours}:${String(mins).padStart(2, "0")}`;
}

function detectZoneHint(): string {
    try {
        const zone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
        const region = zone.split("/")[0]?.replace(/_/g, " ").toUpperCase() ?? "";
        const shortName = new Intl.DateTimeFormat("en-GB", {timeZoneName: "short"})
            .formatToParts(new Date())
            .find((part) => part.type === "timeZoneName")?.value ?? "";
        if (region && shortName) return `${region} (${shortName})`;
        return region || shortName;
    } catch {
        return "";
    }
}

function countInclusiveDays(startIso: string, endIso: string): number | null {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startIso) || !/^\d{4}-\d{2}-\d{2}$/.test(endIso)) return null;
    const start = new Date(`${startIso}T00:00:00Z`).getTime();
    const end = new Date(`${endIso}T00:00:00Z`).getTime();
    if (Number.isNaN(start) || Number.isNaN(end) || end < start) return null;
    return Math.round((end - start) / 86_400_000) + 1;
}

function dailyWindowMinutes(startTime: string, endTime: string): number | null {
    if (!startTime || !endTime || !startTime.includes(":") || !endTime.includes(":")) return null;
    const span = timeToMinutes(endTime) - timeToMinutes(startTime);
    if (!Number.isFinite(span) || span <= 0) return null;
    return span;
}

function formatClockHours(minutes: number): string {
    if (minutes % 60 === 0) {
        const hours = minutes / 60;
        return `${hours} HOUR${hours === 1 ? "" : "S"}`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}H ${mins}M`;
}

function formatCompactHours(minutes: number): string {
    if (minutes % 60 === 0) return `${minutes / 60}H`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}H ${mins}M`;
}

export default function HomePage() {
    const navigate = useNavigate();
    const [error, setError] = useState<unknown>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [joinInput, setJoinInput] = useState("");

    const today = new Date().toISOString().slice(0, 10);

    const [formData, setFormData] = useState({
        title: "",
        timezone: detectUtcOffset(),
        quick_description: "",
        date_start: "",
        date_end: "",
        start_time: "08-00",
        end_time: "20-00",
        slot_minutes: 30,
        custom_slot: "",
    });
    const zoneHint = detectZoneHint();
    const customRaw = formData.custom_slot.trim();
    const hasCustomSlot = customRaw !== "";
    const effectiveSlot = hasCustomSlot ? Number(customRaw) : formData.slot_minutes;
    const dayCount = countInclusiveDays(formData.date_start, formData.date_end);
    const windowMinutes = dailyWindowMinutes(formData.start_time, formData.end_time);
    const slotIsWhole = Number.isInteger(effectiveSlot) && effectiveSlot > 0;
    const slotDividesWindow = windowMinutes !== null && slotIsWhole && windowMinutes % effectiveSlot === 0;
    const slotsPerDay = slotDividesWindow ? windowMinutes / effectiveSlot : null;

    async function handleCreateMeeting(formEvent: React.FormEvent) {
        formEvent.preventDefault();
        setError(null);

        const issues: string[] = [];
        if (!formData.title.trim()) issues.push("title is required");
        // if (formData.timezone.trim().length !== 5) issues.push("timezone must be 5 characters (UTC+1)");
        if (!formData.date_start || !formData.date_end) issues.push("date start and date end are required");
        else if (dayCount === null) issues.push("date end is before date start");
        else if (dayCount > 31) issues.push("date range cannot be longer than 31 days");
        if (!formData.start_time || !formData.end_time) issues.push("daily hours are required");
        else if (windowMinutes === null) issues.push("daily end must be after daily start");
        if (!slotIsWhole) issues.push("slot time must be a positive whole number of minutes");
        else if (windowMinutes !== null && !slotDividesWindow) {
            issues.push(`slot ${effectiveSlot}m does not divide the ${windowMinutes}m daily window`);
        }
        if (issues.length > 0) {
            setError({message: issues.join(" | ")});
            return;
        }

        setIsSubmitting(true);

        try {
            const dto: CreateMeetingDTO = {
                title: formData.title.trim(),
                timezone: formData.timezone.trim(),
                quick_description: formData.quick_description,
                date_start: formData.date_start,
                date_end: formData.date_end,
                day_start_minute: timeToMinutes(formData.start_time),
                day_end_minute: timeToMinutes(formData.end_time),
                slot_minutes: effectiveSlot,
                status: "open",
                creation_date: today,
                admin_id: crypto.randomUUID(),
            };

            const res = await createMeeting(dto);
            if (res.id) {
                navigate(`/m/${res.id}`);
                return;
            }

            setError(res);
        } catch (err) {
            setError({message: String(err)});
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleJoinExisting(formEvent: React.FormEvent) {
        formEvent.preventDefault();
        const raw = joinInput.trim();
        if (!raw) return;
        const extracted = raw.includes("/m/") ? raw.split("/m/").pop() || raw : raw;
        navigate(`/m/${extracted.replace(/\/+$/, "")}`);
    }

    return (
        <div
            className="min-h-screen bg-brand-bg text-brand-dark flex flex-col selection:bg-brand-orange selection:text-white">
            <Navbar/>

            <main className="flex-1 animate-bench">
                <form onSubmit={handleCreateMeeting} className="border-b border-technical technical-grid">
                    <div
                        className="grid grid-cols-1 md:grid-cols-12 border-b border-technical text-xs font-mono font-semibold uppercase tracking-wider bg-brand-bg/90">
                        <div
                            className="md:col-span-4 p-4 md:p-6 border-b md:border-b-0 md:border-r border-technical text-black">
                            SCHEDULING MANUAL
                        </div>
                        <div
                            className="md:col-span-4 p-4 md:p-6 border-b md:border-b-0 md:border-r border-technical text-black flex items-center">
                            3 PHASES / 3 GATES
                        </div>
                        <div className="md:col-span-4 p-4 md:p-6 flex items-center justify-end text-black">

                        </div>
                    </div>

                    <div
                        className="p-6 md:p-10 lg:p-12 border-b border-technical flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <p className="max-w-2xl text-base md:text-lg text-black font-medium leading-relaxed">
                            Three phases, one team, and one hard iceberg lettuce that can roll meat like no other leaf.
                            Place to roll your peers time schedules and wrap up the best schedule like no other
                            schedule.
                        </p>

                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        aria-label={isSubmitting ? "Creating meeting" : "Create and open meeting"}
                        className="group w-full overflow-hidden border-b border-technical select-none text-left cursor-pointer bg-transparent hover:bg-black focus-visible:bg-black focus-visible:outline-none transition-colors disabled:cursor-wait disabled:opacity-70"
                    >
                        <span className="flex items-end gap-3 md:gap-5 px-4 pt-4 pb-2">
                            <span
                                className="text-[16.5vw] leading-[0.78] font-black tracking-tighter uppercase text-black group-hover:text-white group-focus-visible:text-white transition-colors">
                                MEETING
                            </span>
                            <span
                                className="inline-flex shrink-0 items-center justify-center mb-2 md:mb-3 px-5 py-3 md:px-7 md:py-4 bg-brand-orange text-white font-mono text-[10px] md:text-sm font-black uppercase tracking-wider rounded-none whitespace-nowrap border-2 border-black shadow-[4px_4px_0px_#111111] group-hover:bg-black group-hover:text-white group-hover:border-white group-hover:shadow-[4px_4px_0px_#ffffff] group-focus-visible:bg-black group-focus-visible:text-white group-focus-visible:border-white group-focus-visible:shadow-[4px_4px_0px_#ffffff] transition-colors">
                                {isSubmitting ? "CREATING" : "CREATE & OPEN"}
                            </span>
                        </span>
                        <span className="block px-6 md:px-8 pt-4 pb-2">
                            <span
                                className="block w-full h-[2px] bg-black group-hover:bg-white group-focus-visible:bg-white relative transition-colors">
                                <span className="absolute left-0 -top-[1px] h-[4px] w-[42%] bg-brand-orange"/>
                            </span>
                        </span>
                    </button>

                    {Boolean(error) && (
                        <div
                            className="p-4 px-8 bg-brand-orange text-white border-b border-technical font-mono text-xs uppercase font-bold">
                            VALIDATION ERROR: {JSON.stringify(error)}
                        </div>
                    )}

                    <div
                        className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-technical text-xs font-mono bg-brand-bg/95">
                        <div className="p-6 md:p-8 flex flex-col justify-between gap-6">
                            <div>
                                <div className="flex items-baseline gap-2 mb-6">
                                    <span className="text-neutral-600 font-mono font-bold">01</span>
                                    <span className="text-xl font-black font-sans tracking-tight text-black uppercase">
                                        DETAILS
                                    </span>
                                </div>
                                <div className="space-y-4 font-mono text-[11px] uppercase">
                                    <label className="block">
                                        <span className="text-neutral-700 font-semibold block mb-2">TITLE // SESSION NAME</span>
                                        <input
                                            type="text"
                                            required
                                            maxLength={32}
                                            value={formData.title}
                                            placeholder="BIT-MEETING"
                                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                                            className="w-full bg-white border-2 border-black px-2.5 py-2 text-xs font-mono font-bold text-black uppercase placeholder:text-neutral-400 focus:outline-none focus:border-brand-orange"
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="text-neutral-700 font-semibold block mb-2">DESCRIPTION // SHORT NOTE</span>
                                        <input
                                            type="text"
                                            maxLength={120}
                                            value={formData.quick_description}
                                            placeholder="WEEKLY SYNC"
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                quick_description: e.target.value
                                            })}
                                            className="w-full bg-white border-2 border-black px-2.5 py-2 text-xs font-mono font-bold text-black uppercase placeholder:text-neutral-400 focus:outline-none focus:border-brand-orange"
                                        />
                                    </label>
                                    {/*<label className="block">*/}
                                    {/*    <span className="text-neutral-700 font-semibold block mb-2">TIMEZONE // DETECTED OFFSET</span>*/}
                                    {/*    <span*/}
                                    {/*        className={`flex items-center bg-white border-2 ${formData.timezone.trim().length === 5 ? "border-black" : "border-brand-orange"}`}>*/}
                                    {/*        <input*/}
                                    {/*            type="text"*/}
                                    {/*            required*/}
                                    {/*            minLength={5}*/}
                                    {/*            maxLength={6}*/}
                                    {/*            value={formData.timezone}*/}
                                    {/*            onChange={(e) => setFormData({*/}
                                    {/*                ...formData,*/}
                                    {/*                timezone: e.target.value.toUpperCase()*/}
                                    {/*            })}*/}
                                    {/*            className="min-w-0 flex-1 bg-transparent px-2.5 py-2 text-xs font-mono font-bold text-black uppercase focus:outline-none"*/}
                                    {/*        />*/}
                                    {/*        {zoneHint && (*/}
                                    {/*            <span*/}
                                    {/*                className="pr-2.5 text-[10px] font-bold text-neutral-600 whitespace-nowrap">*/}
                                    {/*                // {zoneHint}*/}
                                    {/*            </span>*/}
                                    {/*        )}*/}
                                    {/*    </span>*/}
                                    {/*</label>*/}
                                </div>
                            </div>
                            <div
                                className="flex justify-between items-center gap-3 border-t border-black/30 pt-4 font-mono text-[11px] uppercase">
                                <span className="text-neutral-700 font-semibold">SECURITY // ZERO-AUTH</span>
                                <span className="font-bold text-brand-orange">NO SIGNUP NEEDED</span>
                            </div>
                        </div>

                        <div className="p-6 md:p-8 flex flex-col justify-between gap-6">
                            <div>
                                <div className="flex items-baseline gap-2 mb-6">
                                    <span className="text-neutral-600 font-mono font-bold">02</span>
                                    <span className="text-xl font-black font-sans tracking-tight text-black uppercase">
                                        AVAILABILITY
                                    </span>
                                </div>
                                <div className="space-y-4 font-mono text-[11px] uppercase">
                                    <div className="grid grid-cols-2 gap-3">
                                        <label className="block">
                                            <span
                                                className="text-neutral-700 font-semibold block mb-2">DATE START</span>
                                            <input
                                                type="date"
                                                required
                                                value={formData.date_start}
                                                max={formData.date_end || undefined}
                                                onChange={(e) => setFormData({...formData, date_start: e.target.value})}
                                                className="w-full bg-white border-2 border-black px-2 py-2 text-xs font-mono font-bold text-black focus:outline-none focus:border-brand-orange"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-neutral-700 font-semibold block mb-2">DATE END</span>
                                            <input
                                                type="date"
                                                required
                                                value={formData.date_end}
                                                min={formData.date_start || undefined}
                                                onChange={(e) => setFormData({...formData, date_end: e.target.value})}
                                                className="w-full bg-white border-2 border-black px-2 py-2 text-xs font-mono font-bold text-black focus:outline-none focus:border-brand-orange"
                                            />
                                        </label>
                                    </div>
                                    <div>
                                        <span className="text-neutral-700 font-semibold block mb-2">DAILY HOURS</span>
                                        <div className="grid grid-cols-2 gap-3">
                                            <label className="block">
                                                <span className="text-neutral-500 font-semibold block mb-1">FROM</span>
                                                <input
                                                    type="time"
                                                    required
                                                    value={formData.start_time}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        start_time: e.target.value
                                                    })}
                                                    className="w-full bg-white border-2 border-black px-2 py-2 text-xs font-mono font-bold text-black focus:outline-none focus:border-brand-orange"
                                                />
                                            </label>
                                            <label className="block">
                                                <span className="text-neutral-500 font-semibold block mb-1">TO</span>
                                                <input
                                                    type="time"
                                                    required
                                                    value={formData.end_time}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        end_time: e.target.value
                                                    })}
                                                    className="w-full bg-white border-2 border-black px-2 py-2 text-xs font-mono font-bold text-black focus:outline-none focus:border-brand-orange"
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div
                                className="flex justify-between items-center gap-3 border-t border-black/30 pt-4 font-mono text-[11px] uppercase">
                                <span className="text-neutral-700 font-semibold">
                                    {dayCount === null ? "— DAYS" : `${dayCount} DAY${dayCount === 1 ? "" : "S"}`}
                                    {" / "}
                                    {windowMinutes === null ? "— DAILY WINDOW" : `${formatClockHours(windowMinutes)} DAILY WINDOW`}
                                </span>
                                <span className="font-bold text-black whitespace-nowrap">
                                    {dayCount !== null && windowMinutes !== null
                                        ? `${formatCompactHours(dayCount * windowMinutes)} TOTAL`
                                        : "— TOTAL"}
                                </span>
                            </div>
                        </div>

                        <div className="p-6 md:p-8 flex flex-col justify-between gap-6">
                            <div>
                                <div className="flex items-baseline gap-2 mb-6">
                                    <span className="text-neutral-600 font-mono font-bold">03</span>
                                    <span className="text-xl font-black font-sans tracking-tight text-black uppercase">
                                        INTERVALS
                                    </span>
                                </div>
                                <div className="space-y-4 font-mono text-[11px] uppercase">
                                    <div>
                                        <span className="text-neutral-700 font-semibold block mb-2">SLOT TIME</span>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[15, 30, 60].map((mins) => {
                                                const selected = effectiveSlot === mins && slotIsWhole && !hasCustomSlot;
                                                const rejected = windowMinutes !== null && windowMinutes % mins !== 0;
                                                return (
                                                    <button
                                                        key={mins}
                                                        type="button"
                                                        onClick={() => setFormData({
                                                            ...formData,
                                                            slot_minutes: mins,
                                                            custom_slot: "",
                                                        })}
                                                        className={`px-2.5 py-2 border-2 border-black font-mono text-xs font-bold ${
                                                            selected
                                                                ? "bg-brand-orange text-white"
                                                                : rejected
                                                                    ? "bg-white text-neutral-400"
                                                                    : "bg-white text-black hover:bg-black hover:text-white"
                                                        }`}
                                                    >
                                                        {mins}M
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <label className="block">
                                        <span className="text-neutral-700 font-semibold block mb-2">OR CUSTOM DURATION (MINUTES)</span>
                                        <span className={`flex items-center bg-white border-2 ${
                                            hasCustomSlot && windowMinutes !== null && !slotDividesWindow
                                                ? "border-brand-orange"
                                                : "border-black"
                                        }`}>
                                            <input
                                                type="number"
                                                min={1}
                                                step={1}
                                                inputMode="numeric"
                                                value={formData.custom_slot}
                                                placeholder="E.G. 45"
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    custom_slot: e.target.value
                                                })}
                                                className="min-w-0 flex-1 bg-transparent px-2.5 py-2 text-xs font-mono font-bold text-black uppercase placeholder:text-neutral-400 focus:outline-none"
                                            />
                                            <span className="pr-2.5 font-bold text-neutral-600">MIN</span>
                                        </span>
                                    </label>
                                </div>
                            </div>
                            <div
                                className="flex justify-between items-center gap-3 border-t border-black/30 pt-4 font-mono text-[11px] uppercase">
                                <span className="text-neutral-700 font-semibold">TIME SLOTS</span>
                                <span
                                    className={`font-bold whitespace-nowrap ${slotDividesWindow || windowMinutes === null ? "text-black" : "text-brand-orange"}`}>
                                    {!slotIsWhole || windowMinutes === null
                                        ? "— // —"
                                        : slotDividesWindow
                                            ? `${effectiveSlot}M // ${slotsPerDay} SLOTS/DAY`
                                            : `${effectiveSlot}M // NOT IN WINDOW`}
                                </span>
                            </div>
                        </div>
                    </div>
                </form>

                <div
                    className="bg-black text-white border-b border-technical py-3.5 px-6 md:px-12 font-mono text-xs uppercase tracking-widest flex flex-wrap items-center justify-between gap-4 select-none">
          <span>
            01 CONFIGURE WINDOW &nbsp;/&nbsp; 02 IDENTITY SIGN-OFF &nbsp;/&nbsp; 03 PAINT
            AVAILABILITY &nbsp;/&nbsp; 04 LOCK FINAL SLOT
          </span>
                    <span className="text-brand-orange font-bold">
                        HEATMAP DENSITY • NO ACCOUNT REQUIRED
          </span>
                </div>

                <section className="border-b border-technical bg-white p-6 md:p-8">
                    <form
                        onSubmit={handleJoinExisting}
                        className="max-w-5xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4"
                    >
                        <div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-brand-orange block">
                EXISTING SESSION
              </span>
                            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-black">
                                ALREADY HAVE A MEETING LINK OR ID?
                            </h2>
                        </div>

                        <div className="flex flex-1 max-w-xl border-[3px] border-black shadow-[4px_4px_0px_#111111]">
                            <input
                                type="text"
                                value={joinInput}
                                onChange={(e) => setJoinInput(e.target.value)}
                                placeholder="PASTE LINK OR ID..."
                                className="flex-1 px-4 py-3 bg-brand-bg text-black font-mono text-xs font-bold uppercase placeholder:text-neutral-500 focus:outline-none"
                            />
                            <button
                                type="submit"
                                className="px-6 py-3 bg-black text-white font-mono text-xs font-black uppercase tracking-wider hover:bg-brand-orange transition-colors whitespace-nowrap"
                            >
                                PROCEED
                            </button>
                        </div>
                    </form>
                </section>

                <section className="border-b border-technical">
                    <div className="grid grid-cols-2 md:grid-cols-4">
                        <div
                            className="bg-brand-orange text-white p-6 md:p-8 min-h-[170px] md:min-h-[190px] flex flex-col justify-between border-b md:border-b-0 border-r border-technical">
              <span className="text-6xl md:text-7xl font-black tracking-tight tabular-nums">
                100%
              </span>
                            <span className="font-mono text-xs uppercase tracking-wider font-bold">
                PEAK QUORUM ALIGNMENT
              </span>
                        </div>
                        <div
                            className="diagonal-hatch min-h-[170px] md:min-h-[190px] border-b md:border-b-0 border-r border-technical"/>
                        <div
                            className="bg-brand-bg p-6 md:p-8 min-h-[170px] md:min-h-[190px] flex flex-col justify-between border-b md:border-b-0 border-r border-technical">
              <span className="text-6xl md:text-7xl font-black tracking-tight text-black tabular-nums">
                2
              </span>
                            <span className="font-mono text-xs uppercase tracking-wider font-bold text-black">
                AVAILABILITY MODES
              </span>
                        </div>
                        <div
                            className="bg-black text-white p-6 md:p-8 min-h-[170px] md:min-h-[190px] flex flex-col justify-between border-b md:border-b-0">
              <span className="text-6xl md:text-7xl font-black tracking-tight tabular-nums">
                0
              </span>
                            <span className="font-mono text-xs uppercase tracking-wider font-bold text-neutral-300">
                ACCOUNTS REQUIRED
              </span>
                        </div>
                    </div>
                </section>
            </main>

            <Footer/>
        </div>
    );
}
