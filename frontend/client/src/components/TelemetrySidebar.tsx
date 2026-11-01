import type { AvailabilityStatus, CellStats } from "../types.tsx";
import { minutesToTime } from "../utils/time.ts";

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
    <aside className="lg:col-span-4 flex flex-col divide-y divide-technical">
      {/* Gate 01: Respondent Sign-Off Box */}
      <div className="p-6 md:p-8 bg-brand-bg flex flex-col justify-between">
        <div className="flex justify-between font-mono text-xs uppercase font-bold text-black mb-4">
          <span>01 // USERNAME</span>
          <span>{Object.keys(mySlots).length} SLOTS ACTIVE</span>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            value={nickname}
            onChange={(e) => onNicknameChange(e.target.value)}
            placeholder="YOUR NICKNAME..."
            className="w-full px-4 py-3 bg-white border-2 border-black font-mono text-xs font-bold uppercase text-black focus:outline-none focus:border-brand-orange"
          />

          <button
            type="button"
            disabled={isSaving || isLocked}
            onClick={onSaveAvailability}
            className="w-full py-3.5 px-6 bg-brand-orange text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors flex items-center justify-between disabled:opacity-50"
          >
            <span>
              {isSaving
                ? "SAVING TO SERVER..."
                : hasSavedToken
                  ? "UPDATE AVAILABILITY (PUT)"
                  : "COMMIT AVAILABILITY (PUT)"}
            </span>
            <span>→</span>
          </button>

          {hasSavedToken && (
            <button
              type="button"
              disabled={isSaving || isLocked}
              onClick={onDeleteAvailability}
              className="w-full py-2.5 px-4 bg-white text-black border-2 border-black font-mono text-[11px] font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
            >
              DELETE MY SAVED SLOTS (DELETE)
            </button>
          )}

          {saveFeedback && (
            <div className="p-2.5 bg-black text-white font-mono text-[11px] uppercase font-bold">
              {saveFeedback}
            </div>
          )}
        </div>
      </div>

      {/* Gate 02: Dark Telemetry Inspector */}
      <div className="p-6 md:p-8 bg-neutral-900 text-white flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between font-mono text-xs uppercase text-neutral-400 mb-6">
            <span>02 // SLOT INFORMATION</span>
            <span className="text-brand-orange font-bold">
              {hoverStats?.count || 0}/{safeTotal} ALIGNED
            </span>
          </div>

          <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-4 tabular-nums">
            {hoverDate} • {hoveredCell ? minutesToTime(Number(hoverMin)) : "—"}
          </h3>

          <div className="divide-y divide-neutral-800 border-t border-b border-neutral-800 font-mono text-xs uppercase">
            {hoverStats && hoverStats.voters.length > 0 ? (
              hoverStats.voters.map((v, idx) => (
                <div
                  key={`${v.name}_${idx}`}
                  className="py-2.5 flex items-center justify-between"
                >
                  <span className="font-bold text-white">{v.name}</span>
                  <span
                    className={`px-2 py-0.5 font-bold text-[10px] ${
                      v.status === "preferred"
                        ? "bg-brand-orange text-white"
                        : "bg-white text-black"
                    }`}
                  >
                    {v.status === "preferred" ? ":) PREFERRED" : ":| AVAILABLE"}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-6 text-neutral-400">
                No votes recorded in this slot.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gate 03: Orange Dense Technical Grid Verdict Box */}
      <div className="p-6 md:p-8 bg-brand-orange text-white technical-grid-dense flex flex-col justify-between">
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
