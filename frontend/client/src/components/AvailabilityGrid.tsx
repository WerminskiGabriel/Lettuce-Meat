import React from "react";
import type {AvailabilityStatus, CellStats, DayColumn} from "../types.tsx";
import {minutesToTime} from "../utils/time.ts";

type GridCol =
    | { kind: "day"; day: DayColumn }
    | { kind: "week" }
    | { kind: "month"; label: string };

const TIME_COL_WIDTH_PX = 84;
const DAY_COL_WIDTH_PX = 96;
const MONTH_COL_WIDTH_PX = 36;
const WEEK_COL_WIDTH_PX = 16;

function buildGridColumns(days: DayColumn[]): GridCol[] {
    const cols: GridCol[] = [];
    days.forEach((day, index) => {
        if (index > 0) {
            const prev = days[index - 1];
            const weekday = new Date(`${day.iso}T00:00:00Z`).getUTCDay();
            if (prev.monthShort !== day.monthShort) {
                cols.push({kind: "month", label: day.monthShort});
            } else if (weekday === 1) {
                cols.push({kind: "week"});
            }
        }
        cols.push({kind: "day", day});
    });
    return cols;
}

function gridTrackTemplate(cols: GridCol[]): string {
    const tracks = cols.map((col) => {
        if (col.kind === "day") return `${DAY_COL_WIDTH_PX}px`;
        if (col.kind === "month") return `${MONTH_COL_WIDTH_PX}px`;
        return `${WEEK_COL_WIDTH_PX}px`;
    });
    return `${TIME_COL_WIDTH_PX}px ${tracks.join(" ")}`;
}

interface AvailabilityGridProps {
    days: DayColumn[];
    minutes: number[];
    timezone: string;
    brush: AvailabilityStatus;
    onChangeBrush: (brush: AvailabilityStatus) => void;
    mySlots: Record<string, AvailabilityStatus>;
    onClearAllSlots: () => void;
    hoveredCell: string | null;
    onCellMouseDown: (cellKey: string) => void;
    onCellMouseEnter: (cellKey: string) => void;
    onToggleDayColumn: (dayIso: string) => void;
    onToggleHourRow: (startMinute: number) => void;
    isLocked: boolean;
    getCellStats: (cellKey: string) => CellStats;
    totalVoters: number;
    peakDayIsoSet: Set<string>;
}

export default function AvailabilityGrid({
                                             days,
                                             minutes,
                                             timezone,
                                             brush,
                                             onChangeBrush,
                                             mySlots,
                                             onClearAllSlots,
                                             hoveredCell,
                                             onCellMouseDown,
                                             onCellMouseEnter,
                                             onToggleDayColumn,
                                             onToggleHourRow,
                                             isLocked,
                                             getCellStats,
                                             totalVoters,
                                             peakDayIsoSet,
                                         }: AvailabilityGridProps) {
    const safeDenominator = Math.max(totalVoters, 1);
    const cols = buildGridColumns(days);
    const gridColsTemplate = gridTrackTemplate(cols);

    function cellKeyFromTouch(touch: React.Touch) {
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        const cell = target?.closest("[data-cell-key]");
        return cell?.getAttribute("data-cell-key") ?? null;
    }

    function handleMatrixTouchMove(event: React.TouchEvent) {
        if (event.touches.length !== 1) return;
        const cellKey = cellKeyFromTouch(event.touches[0]);
        if (cellKey) {
            event.preventDefault();
            onCellMouseEnter(cellKey);
        }
    }

    return (
        <div className="lg:col-span-8 lg:border-r border-technical flex flex-col justify-between bg-brand-bg order-1 lg:order-none min-w-0">
            {/* Top Brush Bar (2 MODES ONLY: :| AVAILABLE vs :) PREFERRED — THICK BOX) */}
            <div
                className="p-6 md:p-7 border-b border-technical bg-white flex flex-wrap items-center justify-between gap-6 animate-fade-up">
                <div>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-600 block mb-1">
            Paint mode
          </span>
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black">
                        PAINT AVAILABILITY
                    </h2>
                    <p className="mt-2 text-sm font-medium text-neutral-700 max-w-md normal-case">
                        Click or drag across the grid to mark times. Tap the same slot again to clear it, then save
                        your availability.
                    </p>
                </div>

                {/* Thick Chunky Two-State Brutalist Switcher Box (:| AVAILABLE vs :) PREFERRED) */}
                <div className="flex items-stretch border-[3px] border-black shadow-[5px_5px_0px_#111111] bg-black">
                    <button
                        type="button"
                        onClick={() => onChangeBrush("canDo")}
                        className={`px-7 py-4 font-mono text-sm font-black uppercase tracking-wider flex items-center gap-3 transition-colors border-r-[3px] border-black ${
                            brush === "canDo"
                                ? "bg-black text-white"
                                : "bg-brand-bg text-black hover:bg-white"
                        }`}
                    >
                        <span className="font-mono text-base font-black leading-none">:|</span>
                        <span>
              AVAILABLE ({Object.values(mySlots).filter((v) => v === "canDo").length})
            </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => onChangeBrush("preferred")}
                        className={`px-7 py-4 font-mono text-sm font-black uppercase tracking-wider flex items-center gap-3 transition-colors ${
                            brush === "preferred"
                                ? "bg-brand-orange text-white"
                                : "bg-brand-bg text-black hover:bg-white"
                        }`}
                    >
                        <span className="font-mono text-base font-black leading-none">:)</span>
                        <span>
              PREFERRED ({Object.values(mySlots).filter((v) => v === "preferred").length})
            </span>
                    </button>
                </div>
            </div>

            {/* Matrix Table */}
            <p className="md:hidden px-6 py-2 border-b border-technical bg-brand-bgLight font-mono text-[10px] font-bold uppercase text-neutral-600">
                Scroll grid horizontally → · use two fingers to paint while scrolling
            </p>
            <div
                className="select-none overflow-x-auto touch-pan-x overscroll-x-contain"
                onTouchMove={handleMatrixTouchMove}
            >
                <div className="inline-block min-w-full w-max">
                {/* Day Column Headers */}
                <div
                    className="grid border-b border-technical bg-black text-white font-mono"
                    style={{gridTemplateColumns: gridColsTemplate}}
                >
                    <div
                        className="p-4 border-r border-neutral-700 flex flex-col justify-end sticky left-0 z-20 bg-black"
                        style={{width: TIME_COL_WIDTH_PX, minWidth: TIME_COL_WIDTH_PX, maxWidth: TIME_COL_WIDTH_PX}}
                    >
                        <span className="text-[10px] text-neutral-400 uppercase">TZ</span>
                        <span className="text-xs font-bold">{timezone}</span>
                    </div>
                    {cols.map((col, index) => {
                        if (col.kind !== "day") {
                            return (
                                <div
                                    key={`${col.kind}-${index}-head`}
                                    className="bg-brand-bg text-black border-x border-black flex items-center justify-center"
                                >
                                    {col.kind === "month" && (
                                        <span
                                            className="text-[10px] font-bold uppercase tracking-widest"
                                            style={{writingMode: "vertical-rl"}}
                                        >
                                            {col.label}
                                        </span>
                                    )}
                                </div>
                            );
                        }
                        const d = col.day;
                        const isPeakDay = peakDayIsoSet.has(d.iso);
                        const nextIsDay = cols[index + 1]?.kind === "day";
                        return (
                            <button
                                type="button"
                                key={d.iso}
                                disabled={isLocked}
                                onClick={() => onToggleDayColumn(d.iso)}
                                title={`Toggle ${d.shortDay} ${d.dayNum} ${d.monthShort}`}
                                className={`p-4 flex flex-col justify-between text-left w-full h-full cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:bg-neutral-900 ${
                                    nextIsDay ? "border-r border-neutral-700" : ""
                                } bg-black text-white`}
                            >
                                <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-neutral-300">
                                    <span>{d.shortDay}</span>
                                    <span>{d.monthShort}</span>
                                </div>
                                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-2xl md:text-3xl font-black font-sans tracking-tight leading-none">
                    {d.dayNum}
                  </span>
                                    {isPeakDay && (
                                        <span className="px-1.5 py-0.5 bg-brand-orange text-white text-[10px] font-bold">
                      PEAK
                    </span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Time Rows */}
                <div className="divide-y divide-technical">
                    {minutes.map((m) => (
                        <div
                            key={m}
                            className="grid"
                            style={{gridTemplateColumns: gridColsTemplate}}
                        >
                            {/* Time Label Cell */}
                            <button
                                type="button"
                                disabled={isLocked}
                                onClick={() => onToggleHourRow(m)}
                                title={`Toggle row ${minutesToTime(m)}`}
                                className="px-4 h-11 border-r border-technical bg-brand-bgLight flex items-center justify-between font-mono text-xs font-bold text-black tabular-nums sticky left-0 z-20 cursor-pointer hover:bg-white disabled:opacity-60 disabled:cursor-not-allowed"
                                style={{width: TIME_COL_WIDTH_PX, minWidth: TIME_COL_WIDTH_PX, maxWidth: TIME_COL_WIDTH_PX}}
                            >
                                <span>{minutesToTime(m)}</span>
                                {m % 60 === 0 && <span className="w-1.5 h-1.5 bg-black inline-block"/>}
                            </button>

                            {/* Day Slot Cells — RGBA(255, 62, 0, alpha) scales with user count */}
                            {cols.map((col, cIdx) => {
                                if (col.kind !== "day") {
                                    return (
                                        <div
                                            key={`${col.kind}-${m}-${cIdx}`}
                                            className="h-11 bg-brand-bg border-x border-black box-border"
                                            style={{
                                                width:
                                                    col.kind === "month"
                                                        ? MONTH_COL_WIDTH_PX
                                                        : WEEK_COL_WIDTH_PX,
                                                minWidth:
                                                    col.kind === "month"
                                                        ? MONTH_COL_WIDTH_PX
                                                        : WEEK_COL_WIDTH_PX,
                                                maxWidth:
                                                    col.kind === "month"
                                                        ? MONTH_COL_WIDTH_PX
                                                        : WEEK_COL_WIDTH_PX,
                                            }}
                                        />
                                    );
                                }
                                const d = col.day;
                                const cellKey = `${d.iso}_${m}`;
                                const stats = getCellStats(cellKey);
                                const isFull = stats.count === safeDenominator && stats.count > 0;
                                const isHovered = hoveredCell === cellKey;

                                const ratio = stats.count / safeDenominator;
                                const alpha =
                                    stats.count === 0 ? 0 : Number((0.15 + ratio * 0.85).toFixed(2));

                                const cellBgStyle: React.CSSProperties =
                                    stats.count > 0
                                        ? {
                                            backgroundColor: `rgba(255, 62, 0, ${alpha})`,
                                            color: ratio >= 0.65 ? "#FFFFFF" : "#111111",
                                        }
                                        : {
                                            backgroundColor: "#FFFFFF",
                                            color: "#737373",
                                        };

                                return (
                                    <div
                                        key={cellKey}
                                        data-cell-key={cellKey}
                                        onMouseDown={() => onCellMouseDown(cellKey)}
                                        onMouseEnter={() => onCellMouseEnter(cellKey)}
                                        onTouchStart={(event) => {
                                            if (event.touches.length !== 1) return;
                                            event.preventDefault();
                                            onCellMouseDown(cellKey);
                                        }}
                                        className={`h-11 px-3 flex items-center justify-between font-mono text-xs font-bold tabular-nums cursor-pointer transition-none box-border ${
                                            cols[cIdx + 1]?.kind === "day" ? "border-r border-technical" : ""
                                        } ${stats.count === 0 ? "diagonal-hatch-subtle" : ""} ${
                                            isHovered ? "ring-2 ring-inset ring-black" : ""
                                        }`}
                                        style={{
                                            ...cellBgStyle,
                                            width: DAY_COL_WIDTH_PX,
                                            minWidth: DAY_COL_WIDTH_PX,
                                            maxWidth: DAY_COL_WIDTH_PX,
                                        }}
                                    >
                    <span className="tracking-tight">
                      {stats.count}/{safeDenominator}
                    </span>

                                        <span className="flex items-center gap-1 text-[10px] uppercase">
                      {stats.mine === "preferred" && (
                          <span className="px-1.5 py-0.5 bg-black text-white font-bold border border-white/40">
                          :)
                        </span>
                      )}
                                            {stats.mine === "canDo" && (
                                                <span
                                                    className="px-1.5 py-0.5 bg-white text-black font-bold border border-black">
                          :|
                        </span>
                                            )}
                                            {!stats.mine && isFull && (
                                                <span className="px-1.5 py-0.5 bg-black text-white font-bold">
                          MAX
                        </span>
                                            )}
                    </span>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
                </div>
            </div>

            {/* Matrix Legend Footer Bar (RGBA Density Scale) */}
            <div
                className="p-4 px-6 border-t border-technical bg-white flex flex-wrap items-center justify-between gap-4 font-mono text-xs uppercase font-bold">
                <div className="flex flex-wrap items-center gap-5">
                    <span className="text-neutral-600">ORANGE DENSITY:</span>
                    {[
                        {label: "0%", a: 0},
                        {label: "25%", a: 0.25},
                        {label: "50%", a: 0.5},
                        {label: "75%", a: 0.78},
                        {label: "100%", a: 1.0},
                    ].map((step) => (
                        <span key={step.label} className="flex items-center gap-1.5">
              <span
                  className={`w-4 h-4 border border-black inline-block ${
                      step.a === 0 ? "diagonal-hatch-subtle" : ""
                  }`}
                  style={{
                      backgroundColor:
                          step.a === 0 ? "#FFFFFF" : `rgba(255, 62, 0, ${step.a})`,
                  }}
              />
              <span>{step.label}</span>
            </span>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={onClearAllSlots}
                    className="underline hover:text-brand-orange"
                >
                    CLEAR ALL MY SLOTS ({Object.keys(mySlots).length})
                </button>
            </div>
        </div>
    );
}
