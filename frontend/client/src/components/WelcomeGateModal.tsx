import type {CellStats, DayColumn, MeetingData, ParticipantData} from "../types.tsx";

interface WelcomeGateModalProps {
    meeting: MeetingData;
    participants: ParticipantData[];
    days: DayColumn[];
    minutes: number[];
    totalVoters: number;
    nickname: string;
    onNicknameChange: (name: string) => void;
    onEnterGrid: () => void;
    getCellStats: (cellKey: string) => CellStats;
    peakLabel: string;
}

export default function WelcomeGateModal({
                                             meeting,
                                             participants,
                                             days,
                                             minutes,
                                             totalVoters,
                                             nickname,
                                             onNicknameChange,
                                             onEnterGrid,
                                             getCellStats,
                                             peakLabel,
                                         }: WelcomeGateModalProps) {
    const previewMinutes = minutes.slice(0, Math.min(6, minutes.length));
    const previewDays = days.slice(0, Math.min(5, days.length));

    return (
        <section
            className="flex-1 border-b border-technical relative bg-brand-bg technical-grid py-12 md:py-20 px-4 md:px-12 flex flex-col justify-center items-center animate-bench">
            <div
                className="w-full max-w-4xl bg-brand-orange text-white border-2 border-black p-6 md:p-12 relative shadow-[12px_12px_0px_#111111]">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
                    {/* Left Live RGBA Grid Preview Frame */}
                    <div
                        onClick={onEnterGrid}
                        className="md:col-span-5 bg-[#E8E8E4] border-2 border-black relative flex flex-col justify-between p-5 cursor-pointer group"
                    >
                        <div
                            className="flex items-center justify-between border-b border-black pb-2 mb-3 font-mono text-[10px] text-black font-bold uppercase tracking-wider">
                            <span>MEETING_PREVIEW</span>
                            <span className="bg-black text-white px-1.5 py-0.5">{days.length} DAYS</span>
                        </div>

                        {/* Mini RGBA Heatmap Matrix Inside Frame */}
                        <div
                            className="grid gap-[1px] bg-black border border-black my-auto"
                            style={{
                                gridTemplateColumns: `repeat(${Math.max(previewDays.length, 1)}, minmax(0, 1fr))`,
                            }}
                        >
                            {previewMinutes.map((m) =>
                                previewDays.map((d) => {
                                    const st = getCellStats(`${d.iso}_${m}`);
                                    const alpha =
                                        st.count === 0
                                            ? 0
                                            : Number((0.15 + (st.count / Math.max(totalVoters, 1)) * 0.85).toFixed(2));
                                    return (
                                        <div
                                            key={`${d.iso}_${m}`}
                                            className="h-5"
                                            style={{
                                                backgroundColor:
                                                    st.count === 0 ? "#EDEDE9" : `rgba(255, 62, 0, ${alpha})`,
                                            }}
                                        />
                                    );
                                })
                            )}
                        </div>

                        <div
                            className="mt-3 pt-2 border-t border-black flex items-center justify-between font-mono text-[10px] text-black font-bold uppercase">
                            <span>{peakLabel}</span>
                            <span className="group-hover:translate-x-1 transition-transform">
                EXPAND GRID →
              </span>
                        </div>
                    </div>

                    {/* Right Content Block: Welcome + Already Chose + Nickname Gate */}
                    <div className="md:col-span-7 flex flex-col justify-between space-y-5">
                        <div>
                            <div
                                className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-white font-bold mb-2">
                                <span className="px-2 py-0.5 bg-black text-white">GATE 01</span>
                                <span>•</span>
                                <span>{meeting.timezone}</span>
                                <span>•</span>
                                <span>{meeting.slot_minutes} MIN SLOTS</span>
                            </div>

                            <p className="font-mono text-xs uppercase tracking-wider text-white/90 font-semibold mb-1">
                                WELCOME TO MEETING:
                            </p>
                            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white uppercase leading-none break-words">
                                {meeting.title}
                            </h1>
                        </div>

                        {/* Already Chose Respondents */}
                        <div className="bg-black text-white border-2 border-black p-4 space-y-2.5 font-mono">
                            <div
                                className="flex items-center justify-between text-xs tracking-wider text-neutral-300 font-semibold uppercase">
                                <span>STATUS: <span className="text-white">{meeting.status.toUpperCase()}</span></span>
                                <span>ALREADY CHOSE ({participants.length}):</span>
                            </div>
                            <div className="pt-1 pb-1">
                                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">DESCRIPTION:</p>
                                <p className="text-xs text-neutral-200 mt-0.5 leading-relaxed font-mono normal-case">
                                    {meeting.quick_description ?? ""}
                                </p>
                            </div>
                            <div className="w-full h-px bg-neutral-800"/>
                            {participants.length > 0 ? (
                                <div className="flex flex-wrap gap-2 pt-0.5">
                                    {participants.map((p) => (
                                        <span
                                            key={p.id}
                                            className="px-2.5 py-1 bg-white text-black font-mono text-xs font-bold uppercase flex items-center gap-1.5"
                                        >
                                            <span className="w-2 h-2 bg-brand-orange inline-block"/>
                                            {p.display_name}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-xs text-neutral-300 font-mono tracking-tight pt-0.5 uppercase">
                                    NO VOTES RECORDED YET — BE THE FIRST TO SIGN OFF.
                                </div>
                            )}
                        </div>

                        {/* Nickname Input & Morph CTA */}
                        <div className="pt-1">
                            <label className="block font-mono text-xs uppercase font-bold text-white mb-2">
                                YOUR NICKNAME:
                            </label>
                            <div className="flex flex-col sm:flex-row gap-0 border-2 border-black bg-white">
                                <input
                                    type="text"
                                    value={nickname}
                                    onChange={(e) => onNicknameChange(e.target.value)}
                                    onKeyUp={(e) => {
                                        if (e.key == "Enter") {
                                            onEnterGrid()
                                        }
                                    }}
                                    placeholder="ENTER YOUR NAME..."
                                    className="flex-1 px-4 py-3.5 bg-white text-black font-mono text-xs font-bold uppercase placeholder:text-neutral-400 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={onEnterGrid}
                                    className="px-6 py-3.5 bg-black text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors whitespace-nowrap"
                                >
                                    OPEN MEETING GRID
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
