import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import type {CreateMeetingDTO} from "../types.tsx";
import {createMeeting} from "../api/client.ts";
import {timeToMinutes} from "../utils/time.ts";
import Navbar from "../components/Navbar.tsx";
import Footer from "../components/Footer.tsx";

export default function HomePage() {
    const navigate = useNavigate();
    const [error, setError] = useState<unknown>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [joinInput, setJoinInput] = useState("");

    const today = new Date().toISOString().slice(0, 10);

    const [formData, setFormData] = useState({
        title: "BIT-MEETING",
        timezone: "UTC+1",
        date_start: "2026-10-28",
        date_end: "2026-11-01",
        start_time: "08:00",
        end_time: "14:00",
        slot_minutes: 30,
    });

    async function handleCreateMeeting(formEvent: React.FormEvent) {
        formEvent.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const dto: CreateMeetingDTO = {
                title: formData.title.trim() || "QUORUM-SESSION",
                timezone: formData.timezone,
                date_start: formData.date_start,
                date_end: formData.date_end,
                day_start_minute: timeToMinutes(formData.start_time),
                day_end_minute: timeToMinutes(formData.end_time),
                slot_minutes: Number(formData.slot_minutes),
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
                            <span>REV. 10 / 2026</span>
                        </div>
                    </div>

                    <div
                        className="p-6 md:p-10 lg:p-12 border-b border-technical flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <p className="max-w-2xl text-base md:text-lg text-black font-medium leading-relaxed">
                            Three phases, one team, and a hard stop at the end of each. Nothing moves to the
                            calendar until it has passed its quorum gate, so scheduling conflicts surface on our
                            bench, not in your group chat.
                        </p>
                        <div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex items-center justify-center px-7 py-4 bg-brand-orange text-white font-mono text-xs md:text-sm font-black uppercase tracking-wider hover:bg-black transition-colors rounded-none whitespace-nowrap border-2 border-black shadow-[4px_4px_0px_#111111] cursor-pointer"
                            >
                                {isSubmitting ? "CREATING QUORUM..." : "CREATE & OPEN QUORUM BENCH →"}
                            </button>
                        </div>
                    </div>

                    <div className="overflow-hidden border-b border-technical select-none">
                        <h1 className="text-[16.5vw] leading-[0.78] font-black tracking-tighter uppercase px-4 pt-4 pb-2 text-black">
                            QUORUM
                        </h1>
                        <div className="px-6 md:px-8 pt-4 pb-2">
                            <div className="w-full h-[2px] bg-black relative">
                                <div className="absolute left-0 -top-[1px] h-[4px] w-[42%] bg-brand-orange"/>
                            </div>
                        </div>
                    </div>

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
                    CONFIGURE
                  </span>
                                </div>
                                <div className="space-y-3 font-mono text-[11px] uppercase">
                                    <div
                                        className="flex justify-between items-center border-b border-black/30 pb-2 gap-2">
                                        <span className="text-neutral-700 font-semibold">MEETING TITLE</span>
                                        <input
                                            type="text"
                                            required
                                            maxLength={50}
                                            value={formData.title}
                                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                                            className="bg-white border-2 border-black px-2.5 py-1.5 text-xs font-mono font-bold text-black uppercase w-48 focus:outline-none focus:border-brand-orange"
                                        />
                                    </div>
                                    <div
                                        className="flex justify-between items-center border-b border-black/30 pb-2 gap-2">
                                        <span className="text-neutral-700 font-semibold">TIMEZONE</span>
                                        <input
                                            type="text"
                                            required
                                            minLength={5}
                                            maxLength={5}
                                            value={formData.timezone}
                                            onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                                            className="bg-white border-2 border-black px-2.5 py-1.5 text-xs font-mono font-bold text-black uppercase w-28 text-right focus:outline-none focus:border-brand-orange"
                                        />
                                    </div>
                                    <div className="flex justify-between pb-1">
                                        <span className="text-neutral-700 font-semibold">GATE</span>
                                        <span className="font-bold text-black">UNIQUE /M/:ID LINK</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 md:p-8 flex flex-col justify-between gap-6">
                            <div>
                                <div className="flex items-baseline gap-2 mb-6">
                                    <span className="text-neutral-600 font-mono font-bold">02</span>
                                    <span className="text-xl font-black font-sans tracking-tight text-black uppercase">
                    WINDOW
                  </span>
                                </div>
                                <div className="space-y-3 font-mono text-[11px] uppercase">
                                    <div
                                        className="flex justify-between items-center border-b border-black/30 pb-2 gap-2">
                                        <span className="text-neutral-700 font-semibold">DATE START</span>
                                        <input
                                            type="date"
                                            required
                                            value={formData.date_start}
                                            onChange={(e) => setFormData({...formData, date_start: e.target.value})}
                                            className="bg-white border-2 border-black px-2 py-1 text-xs font-mono font-bold text-black focus:outline-none focus:border-brand-orange"
                                        />
                                    </div>
                                    <div
                                        className="flex justify-between items-center border-b border-black/30 pb-2 gap-2">
                                        <span className="text-neutral-700 font-semibold">DATE END</span>
                                        <input
                                            type="date"
                                            required
                                            value={formData.date_end}
                                            onChange={(e) => setFormData({...formData, date_end: e.target.value})}
                                            className="bg-white border-2 border-black px-2 py-1 text-xs font-mono font-bold text-black focus:outline-none focus:border-brand-orange"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center pb-1 gap-2">
                                        <span className="text-neutral-700 font-semibold">DAILY HOURS</span>
                                        <div className="flex items-center gap-1">
                                            <input
                                                type="time"
                                                required
                                                value={formData.start_time}
                                                onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                                                className="bg-white border-2 border-black px-1.5 py-1 text-xs font-mono font-bold text-black"
                                            />
                                            <span>–</span>
                                            <input
                                                type="time"
                                                required
                                                value={formData.end_time}
                                                onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                                                className="bg-white border-2 border-black px-1.5 py-1 text-xs font-mono font-bold text-black"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 md:p-8 flex flex-col justify-between gap-6">
                            <div>
                                <div className="flex items-baseline gap-2 mb-6">
                                    <span className="text-neutral-600 font-mono font-bold">03</span>
                                    <span className="text-xl font-black font-sans tracking-tight text-black uppercase">
                    PROVE & LOCK
                  </span>
                                </div>
                                <div className="space-y-3 font-mono text-[11px] uppercase">
                                    <div className="flex justify-between items-center border-b border-black/30 pb-2">
                                        <span className="text-neutral-700 font-semibold">SLOT CADENCE</span>
                                        <div className="flex gap-1">
                                            {[15, 30, 60].map((mins) => (
                                                <button
                                                    key={mins}
                                                    type="button"
                                                    onClick={() => setFormData({...formData, slot_minutes: mins})}
                                                    className={`px-2.5 py-1 border-2 border-black font-mono text-xs font-bold ${
                                                        formData.slot_minutes === mins
                                                            ? "bg-brand-orange text-white"
                                                            : "bg-white text-black hover:bg-black hover:text-white"
                                                    }`}
                                                >
                                                    {mins}M
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex justify-between border-b border-black/30 pb-2">
                                        <span className="text-neutral-700 font-semibold">SIGNAL MODES</span>
                                        <span className="font-bold text-black">:| AVAILABLE / :) PREFERRED</span>
                                    </div>
                                    <div className="flex justify-between pb-1">
                                        <span className="text-neutral-700 font-semibold">HEATMAP</span>
                                        <span className="font-bold text-brand-orange">RGBA(255, 62, 0, A)</span>
                                    </div>
                                </div>
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
            RGBA HEATMAP DENSITY • NO ACCOUNT REQUIRED
          </span>
                </div>

                <section className="border-b border-technical bg-white p-6 md:p-8">
                    <form
                        onSubmit={handleJoinExisting}
                        className="max-w-5xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4"
                    >
                        <div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-brand-orange block">
                EXISTING SESSION GATE
              </span>
                            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-black">
                                ALREADY HAVE A MEETING LINK OR UUID?
                            </h2>
                        </div>

                        <div className="flex flex-1 max-w-xl border-[3px] border-black shadow-[4px_4px_0px_#111111]">
                            <input
                                type="text"
                                value={joinInput}
                                onChange={(e) => setJoinInput(e.target.value)}
                                placeholder="PASTE /M/:ID OR UUID..."
                                className="flex-1 px-4 py-3 bg-brand-bg text-black font-mono text-xs font-bold uppercase placeholder:text-neutral-500 focus:outline-none"
                            />
                            <button
                                type="submit"
                                className="px-6 py-3 bg-black text-white font-mono text-xs font-black uppercase tracking-wider hover:bg-brand-orange transition-colors whitespace-nowrap"
                            >
                                OPEN GATE →
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
                SIGNAL MODES (:| AND :))
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
