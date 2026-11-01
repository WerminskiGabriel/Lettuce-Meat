import {useState, useEffect, useCallback} from "react";
import {useParams, useNavigate} from "react-router-dom";
import type {
    AvailabilityStatus,
    AvailabilitySlotDTO,
    CellStats,
    GetMeetingResponse,
} from "../types.tsx";
import {
    getMeeting,
    editMeetingAvailability,
    deleteMeetingAvailability,
} from "../api/client.ts";
import {
    minutesToTime,
    generateDaysList,
    generateMinutesList,
    normalizeFlaskDate,
} from "../utils/time.ts";
import Navbar from "../components/Navbar.tsx";
import Footer from "../components/Footer.tsx";
import WelcomeGateModal from "../components/WelcomeGateModal.tsx";
import AvailabilityGrid from "../components/AvailabilityGrid.tsx";
import TelemetrySidebar from "../components/TelemetrySidebar.tsx";

export default function MeetingPage() {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [stage, setStage] = useState<"welcome" | "bench">("welcome");
    const [meetingData, setMeetingData] = useState<GetMeetingResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [notFound, setNotFound] = useState<boolean>(false);

    const [brush, setBrush] = useState<AvailabilityStatus>("canDo");
    const [dragAction, setDragAction] = useState<"paint" | "remove" | null>(null);

    const [nickname, setNickname] = useState<string>(() => {
        if (!id) return "GUEST";
        return localStorage.getItem(`lettucemeat_nick_${id}`) || "";
    });
    const [token, setToken] = useState<string>(() => {
        if (!id) return "";
        return localStorage.getItem(`lettucemeat_token_${id}`) || "";
    });
    const [participantId, setParticipantId] = useState<string | null>(() => {
        if (!id) return null;
        return localStorage.getItem(`lettucemeat_pid_${id}`);
    });

    const [mySlots, setMySlots] = useState<Record<string, AvailabilityStatus>>({});
    const [hoveredCell, setHoveredCell] = useState<string | null>(null);
    const [isHostMode, setIsHostMode] = useState<boolean>(true);
    const [isLocked, setIsLocked] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

    const loadMeeting = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            const savedToken = localStorage.getItem(`lettucemeat_token_${id}`) || undefined;
            const res: GetMeetingResponse = await getMeeting(id, savedToken);
            if (!res || !res.meeting) {
                setNotFound(true);
                return;
            }
            setMeetingData(res);
            setIsLocked(res.meeting.status === "closed");

            if (res.slots_mine && res.slots_mine.length > 0) {
                const restored: Record<string, AvailabilityStatus> = {};
                for (const s of res.slots_mine) {
                    const iso = normalizeFlaskDate(s.on_date);
                    restored[`${iso}_${s.start_minute}`] = s.availability;
                }
                setMySlots(restored);
            }
        } catch {
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadMeeting();
    }, [loadMeeting]);

    useEffect(() => {
        const stopDrag = () => setDragAction(null);
        window.addEventListener("mouseup", stopDrag);
        return () => window.removeEventListener("mouseup", stopDrag);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-bg flex flex-col">
                <Navbar meetingId={id}/>
                <div className="flex-1 flex items-center justify-center font-mono text-sm font-black uppercase">
                    LOADING QUORUM BENCH...
                </div>
                <Footer/>
            </div>
        );
    }

    if (notFound || !meetingData) {
        return (
            <div className="min-h-screen bg-brand-bg flex flex-col">
                <Navbar/>
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <div className="bg-white border-[3px] border-black p-8 max-w-md shadow-[8px_8px_0px_#111111]">
                        <div className="font-mono text-xs font-bold uppercase text-brand-orange mb-2">
                            ERROR 404 // NOT FOUND
                        </div>
                        <h1 className="text-3xl font-black uppercase tracking-tight mb-4">
                            QUORUM SESSION DOES NOT EXIST
                        </h1>
                        <button
                            type="button"
                            onClick={() => navigate("/")}
                            className="px-6 py-3 bg-black text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-brand-orange"
                        >
                            RETURN TO CREATE →
                        </button>
                    </div>
                </div>
                <Footer/>
            </div>
        );
    }

    const {meeting, participants, slots} = meetingData;
    const days = generateDaysList(meeting.date_start, meeting.date_end);
    const minutes = generateMinutesList(
        meeting.day_start_minute,
        meeting.day_end_minute,
        meeting.slot_minutes
    );

    const participantNameById: Record<string, string> = {};
    for (const p of participants) {
        participantNameById[p.id] = p.display_name;
    }

    const hasSavedParticipantInList = Boolean(
        participantId && participants.some((p) => p.id === participantId)
    );
    const hasUnsavedLocalSelections = Object.keys(mySlots).length > 0;
    const totalVoters =
        participants.length + (!hasSavedParticipantInList && hasUnsavedLocalSelections ? 1 : 0);

    function getCellStats(cellKey: string): CellStats {
        const [targetIso, targetMinStr] = cellKey.split("_");
        const targetMin = Number(targetMinStr);

        const voters: { name: string; status: AvailabilityStatus }[] = [];

        for (const s of slots) {
            if (participantId && s.participant_id === participantId) {
                continue;
            }
            const slotIso = normalizeFlaskDate(s.on_date);
            if (slotIso === targetIso && s.start_minute === targetMin) {
                const voterName =
                    (s.participant_id && participantNameById[s.participant_id]) || "RESPONDENT";
                voters.push({name: voterName.toUpperCase(), status: s.availability});
            }
        }

        const mineStatus = mySlots[cellKey] || null;
        if (mineStatus) {
            voters.push({
                name: `${(nickname || "YOU").toUpperCase()} (YOU)`,
                status: mineStatus,
            });
        }

        const preferredCount = voters.filter((v) => v.status === "preferred").length;
        return {
            count: voters.length,
            preferredCount,
            mine: mineStatus,
            voters,
        };
    }

    let bestSlotSummary: {
        dateLabel: string;
        timeLabel: string;
        count: number;
        preferredCount: number;
        iso: string;
    } | null = null;

    for (const d of days) {
        for (const m of minutes) {
            const st = getCellStats(`${d.iso}_${m}`);
            if (st.count > 0) {
                if (
                    !bestSlotSummary ||
                    st.count > bestSlotSummary.count ||
                    (st.count === bestSlotSummary.count &&
                        st.preferredCount > bestSlotSummary.preferredCount)
                ) {
                    bestSlotSummary = {
                        dateLabel: `${d.shortDay} ${d.dayNum} ${d.monthShort}`,
                        timeLabel: `${minutesToTime(m)}–${minutesToTime(m + meeting.slot_minutes)}`,
                        count: st.count,
                        preferredCount: st.preferredCount,
                        iso: d.iso,
                    };
                }
            }
        }
    }

    const peakDayIsoSet = new Set<string>();
    if (bestSlotSummary && bestSlotSummary.count > 0) {
        peakDayIsoSet.add(bestSlotSummary.iso);
    }

    function handleCellMouseDown(cellKey: string) {
        if (isLocked) return;
        const existing = mySlots[cellKey];
        const nextAction = existing === brush ? "remove" : "paint";
        setDragAction(nextAction);

        setMySlots((prev) => {
            const next = {...prev};
            if (nextAction === "remove") {
                delete next[cellKey];
            } else {
                next[cellKey] = brush;
            }
            return next;
        });
    }

    function handleCellMouseEnter(cellKey: string) {
        setHoveredCell(cellKey);
        if (!dragAction || isLocked) return;

        setMySlots((prev) => {
            const next = {...prev};
            if (dragAction === "remove") {
                delete next[cellKey];
            } else {
                next[cellKey] = brush;
            }
            return next;
        });
    }

    async function handleSaveAvailability() {
        if (!id) return;
        const cleanNick = (nickname.trim() || "GUEST").slice(0, 20);
        setNickname(cleanNick);
        localStorage.setItem(`lettucemeat_nick_${id}`, cleanNick);

        const payloadSlots: AvailabilitySlotDTO[] = Object.entries(mySlots).map(
            ([cellKey, availability]) => {
                const [on_date, minStr] = cellKey.split("_");
                return {
                    on_date,
                    start_minute: Number(minStr),
                    availability,
                };
            }
        );

        setIsSaving(true);
        setSaveFeedback(null);
        try {
            const res = await editMeetingAvailability(
                id,
                {
                    participant_id: participantId,
                    display_name: cleanNick,
                    slots: payloadSlots,
                },
                token || undefined
            );

            if (res.edit_token) {
                setToken(res.edit_token);
                localStorage.setItem(`lettucemeat_token_${id}`, res.edit_token);
            }
            if (res.participant_id) {
                setParticipantId(res.participant_id);
                localStorage.setItem(`lettucemeat_pid_${id}`, String(res.participant_id));
            }

            setSaveFeedback("YOUR AVAILABILITY WAS SAVED");
            await loadMeeting();
        } catch {
            setSaveFeedback("ERROR SAVING AVAILABILITY");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDeleteAvailability() {
        if (!id || !token || !meetingData) return;
        const cleanNick = (nickname.trim() || "GUEST").slice(0, 20);

        const slotsToDelete: AvailabilitySlotDTO[] =
            meetingData.slots_mine && meetingData.slots_mine.length > 0
                ? meetingData.slots_mine.map((s) => ({
                    on_date: normalizeFlaskDate(s.on_date),
                    start_minute: s.start_minute,
                    availability: s.availability,
                }))
                : Object.entries(mySlots).map(([cellKey, availability]) => {
                    const [on_date, minStr] = cellKey.split("_");
                    return {
                        on_date,
                        start_minute: Number(minStr),
                        availability,
                    };
                });

        setIsSaving(true);
        setSaveFeedback(null);
        try {
            await deleteMeetingAvailability(
                id,
                {
                    participant_id: participantId,
                    display_name: cleanNick,
                    slots: slotsToDelete,
                },
                token
            );
            setMySlots({});
            setSaveFeedback("YOUR AVAILABILITY WAS SAVED");
            await loadMeeting();
        } catch {
            setSaveFeedback("ERROR DELETING SLOTS");
        } finally {
            setIsSaving(false);
        }
    }

    const activeHoverKey =
        hoveredCell || (days[0] && minutes[0] !== undefined ? `${days[0].iso}_${minutes[0]}` : null);
    const activeHoverStats = activeHoverKey ? getCellStats(activeHoverKey) : null;

    return (
        <div
            className="min-h-screen bg-brand-bg text-brand-dark flex flex-col selection:bg-brand-orange selection:text-white">
            <Navbar
                meetingId={id}
                activeStage={stage}
                onChangeStage={setStage}
                isHostMode={isHostMode}
                onToggleHostMode={() => setIsHostMode((v) => !v)}
            />

            {stage === "welcome" ? (
                <WelcomeGateModal
                    meeting={meeting}
                    participants={participants}
                    days={days}
                    minutes={minutes}
                    totalVoters={totalVoters}
                    nickname={nickname}
                    onNicknameChange={setNickname}
                    onEnterGrid={() => setStage("bench")}
                    getCellStats={getCellStats}
                    peakLabel={
                        bestSlotSummary
                            ? `PEAK: ${bestSlotSummary.dateLabel} (${bestSlotSummary.count}/${Math.max(totalVoters, 1)})`
                            : "NO SLOTS MARKED YET"
                    }
                />
            ) : (
                <div className="animate-bench flex-1 flex flex-col">
                    <div
                        className="grid grid-cols-1 md:grid-cols-12 border-b border-technical text-xs font-mono font-bold uppercase tracking-wider bg-brand-bg">
                        <div
                            className="md:col-span-4 p-4 px-6 border-b md:border-b-0 md:border-r border-technical text-black flex items-center justify-between">
                            <span>MEETING TITLE: {meeting.title.toUpperCase()}</span>
                            <span className="px-2 py-0.5 bg-black text-white text-[10px]">
                {isLocked ? "LOCKED" : "OPEN"}
              </span>
                        </div>
                        <div
                            className="md:col-span-5 p-4 px-6 border-b md:border-b-0 md:border-r border-technical text-black flex items-center">
                            CLICK OR DRAG TO MARK
                        </div>
                        <div className="md:col-span-3 p-4 px-6 flex items-center justify-between text-black">
                            <span>TOTAL VOTERS: {totalVoters}</span>
                            <button
                                type="button"
                                onClick={() => setStage("welcome")}
                                className="underline hover:text-brand-orange font-bold"
                            >
                                INTRO SECTION
                            </button>
                        </div>
                    </div>

                    <section className="border-b border-technical flex-1 grid grid-cols-1 lg:grid-cols-12">
                        <AvailabilityGrid
                            days={days}
                            minutes={minutes}
                            timezone={meeting.timezone}
                            brush={brush}
                            onChangeBrush={setBrush}
                            mySlots={mySlots}
                            onClearAllSlots={() => setMySlots({})}
                            hoveredCell={activeHoverKey}
                            onCellMouseDown={handleCellMouseDown}
                            onCellMouseEnter={handleCellMouseEnter}
                            getCellStats={getCellStats}
                            totalVoters={totalVoters}
                            peakDayIsoSet={peakDayIsoSet}
                        />

                        <TelemetrySidebar
                            nickname={nickname}
                            onNicknameChange={setNickname}
                            mySlots={mySlots}
                            onSaveAvailability={handleSaveAvailability}
                            onDeleteAvailability={handleDeleteAvailability}
                            hasSavedToken={Boolean(token)}
                            isSaving={isSaving}
                            saveFeedback={saveFeedback}
                            hoveredCell={activeHoverKey}
                            hoverStats={activeHoverStats}
                            totalVoters={totalVoters}
                            bestSlotSummary={bestSlotSummary}
                            isHostMode={isHostMode}
                            isLocked={isLocked}
                            onToggleLock={() => setIsLocked((v) => !v)}
                        />
                    </section>
                </div>
            )}

            <Footer/>
        </div>
    );
}
