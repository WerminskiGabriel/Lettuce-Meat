import type {AvailabilityStatus, CellStats} from "../types.tsx";
import {minutesToTime} from "../utils/time.ts";

interface TelemetrySidebarProps {
    nickname: string;
    onNicknameChange: (name: string) => void;
    mySlots: Record<string, AvailabilityStatus>;
    onSaveAvailability: () => void;
    onDeleteAvailability: () => void;
    hasSavedToken: boolean;
    isSaving: boolean;
    saveFeedback: string | null;
    hoveredCell: string | null;
    hoverStats: CellStats | null;
    totalVoters: number;
    bestSlotSummary: {
        dateLabel: string;
        timeLabel: string;
        count: number;
        preferredCount: number;
    } | null;
    isHostMode: boolean;
    isLocked: boolean;
    onToggleLock: () => void;
}

export default function TelemetrySidebar({
                                             nickname,
                                             onNicknameChange,
                                             mySlots,
                                             onSaveAvailability,
                                             onDeleteAvailability,
                                             hasSavedToken,
                                             isSaving,
                                             saveFeedback,
                                             hoveredCell,
                                             hoverStats,
                                             totalVoters,
                                             bestSlotSummary,
                                             isHostMode,
                                             isLocked,
                                             onToggleLock,
                                         }: TelemetrySidebarProps) {
    const [hoverDate, hoverMin] = hoveredCell ? hoveredCell.split("_") : ["—", "0"];
    const safeTotal = Math.max(totalVoters, 1);

    return (
        <aside className="lg:col-span-4 flex flex-col divide-y divide-technical order-2 lg:order-none">
            {/* Gate 01: Respondent Sign-Off Box */}
            <div className="p-6 md:p-8 bg-white flex flex-col justify-between lg:static sticky bottom-0 z-40 border-t-2 border-black lg:border-t-0 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] lg:shadow-none animate-fade-up">
                <div className="flex justify-between font-mono text-xs uppercase font-bold text-neutral-600 mb-4">
                    <span>Your name</span>
                    <span>{Object.keys(mySlots).length} slots marked</span>
                </div>

                <div className="space-y-3">
                    <input
                        type="text"
                        value={nickname}
                        onChange={(e) => onNicknameChange(e.target.value)}
                        placeholder="Nickname for this meeting"
                        className="w-full px-4 py-3 bg-brand-bgLight border-2 border-black font-sans text-sm font-medium text-black placeholder:text-neutral-500 focus:outline-none focus:border-brand-orange"
                    />

                    <button
                        type="button"
                        disabled={isSaving || isLocked}
                        onClick={onSaveAvailability}
                        className="w-full py-3.5 px-6 bg-brand-orange text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-brand-orangeDark transition-colors flex items-center justify-between disabled:opacity-50"
                    >
            <span>
              {isSaving
                  ? "Saving…"
                  : hasSavedToken
                      ? "Update availability"
                      : "Save availability"}
            </span>
                        <span>→</span>
                    </button>

                    {hasSavedToken && (
                        <button
                            type="button"
                            disabled={isSaving || isLocked}
                            onClick={onDeleteAvailability}
                            className="w-full py-2.5 px-4 bg-white text-black border-2 border-black font-mono text-[11px] font-bold uppercase tracking-wider hover:bg-brand-bgLight transition-colors"
                        >
                            Remove my saved slots
                        </button>
                    )}

                    {saveFeedback && (
                        <div className="p-2.5 bg-brand-bgLight border border-black font-mono text-[11px] uppercase font-bold text-black">
                            {saveFeedback}
                        </div>
                    )}
                </div>
            </div>

            {/* Gate 02: Slot inspector */}
            <div className="p-6 md:p-8 bg-brand-bgLight text-black flex-1 flex flex-col justify-between animate-fade-up-delay hidden lg:flex">
                <div>
                    <div className="flex justify-between font-mono text-xs uppercase text-neutral-600 mb-6">
                        <span>Slot details</span>
                        <span className="text-brand-orange font-bold">
              {hoverStats?.count || 0}/{safeTotal} aligned
            </span>
                    </div>

                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black mb-4 tabular-nums">
                        {hoverDate} • {hoveredCell ? minutesToTime(Number(hoverMin)) : "—"}
                    </h3>

                    <div
                        className="divide-y divide-neutral-300 border-t border-b border-technical font-mono text-xs uppercase">
                        {hoverStats && hoverStats.voters.length > 0 ? (
                            hoverStats.voters.map((v, idx) => (
                                <div
                                    key={`${v.name}_${idx}`}
                                    className="py-2.5 flex items-center justify-between"
                                >
                                    <span className="font-bold text-black">{v.name}</span>
                                    <span
                                        className={`px-2 py-0.5 font-bold text-[10px] ${
                                            v.status === "preferred"
                                                ? "bg-brand-orange text-white"
                                                : "bg-white text-black border border-black"
                                        }`}
                                    >
                    {v.status === "preferred" ? ":) preferred" : ":| available"}
                  </span>
                                </div>
                            ))
                        ) : (
                            <div className="py-6 text-neutral-600 normal-case">
                                Hover or tap a cell to see who voted here.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Gate 03: Orange Dense Technical Grid Verdict Box */}
            <div className="p-6 md:p-8 bg-brand-orange text-white technical-grid-dense flex flex-col justify-between animate-fade-up-delay hidden lg:flex">
                <div className="flex justify-between font-mono text-xs uppercase font-bold text-white mb-6">
                    <span className="bg-black px-2 py-0.5">03 // QUORUM VERDICT</span>
                    <span className="bg-white text-black px-2 py-0.5">
            {bestSlotSummary
                ? `${bestSlotSummary.count}/${safeTotal} MATCH`
                : "AWAITING VOTES"}
          </span>
                </div>

                <div className="bg-brand-orange/95 border border-white/50 p-4 mb-4">
                    <div className="font-mono text-[11px] uppercase tracking-widest text-white/90 mb-1">
                        BEST WINDOW FOUND
                    </div>
                    {bestSlotSummary ? (
                        <>
                            <div className="text-2xl font-black uppercase tracking-tight text-white tabular-nums">
                                {bestSlotSummary.dateLabel} • {bestSlotSummary.timeLabel}
                            </div>
                            <div className="font-mono text-xs text-white mt-1">
                                {bestSlotSummary.count}/{safeTotal} VOTERS (
                                {bestSlotSummary.preferredCount} PREFERRED)
                            </div>
                        </>
                    ) : (
                        <div className="text-lg font-black uppercase tracking-tight text-white">
                            MARK SLOTS ON THE GRID TO COMPUTE QUORUM
                        </div>
                    )}
                </div>

                {isHostMode && (
                    <button
                        type="button"
                        onClick={onToggleLock}
                        className="w-full py-3.5 px-5 bg-black text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-colors flex items-center justify-between"
                    >
            <span>
              {isLocked ? "UNLOCK QUORUM BENCH" : "LOCK & SIGN OFF FINAL SLOT"}
            </span>
                        <span>→</span>
                    </button>
                )}
            </div>
        </aside>
    );
}
