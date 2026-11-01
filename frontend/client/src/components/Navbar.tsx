import {useState} from "react";
import {useNavigate, useLocation} from "react-router-dom";

interface NavbarProps {
    meetingId?: string;
    activeStage?: "welcome" | "bench";
    onChangeStage?: (stage: "welcome" | "bench") => void;
    isHostMode?: boolean;
    onToggleHostMode?: () => void;
}

export default function Navbar({
                                   meetingId,
                                   activeStage,
                                   onChangeStage,
                                   isHostMode,
                                   onToggleHostMode,
                               }: NavbarProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const [copied, setCopied] = useState(false);

    const isHome = location.pathname === "/";

    function handleCopyShareLink() {
        const shareUrl = meetingId
            ? `${window.location.origin}/m/${meetingId}`
            : window.location.href;
        navigator.clipboard?.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
    }

    return (
        <header className="border-b-[2px] border-black bg-brand-bg sticky top-0 z-50">
            <div className="flex flex-col md:flex-row items-stretch justify-between min-h-[68px]">
                <div
                    className="flex items-center justify-between px-6 py-4 md:py-0 md:px-8 border-b-[2px] md:border-b-0 md:border-r-[2.5px] border-black bg-brand-bg">
                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="text-2xl md:text-3xl font-black tracking-tighter text-black uppercase flex items-center gap-3"
                    >
                        <span>LETTUCE-MEAT</span>
                        <span className="inline-block w-3 h-3 bg-brand-orange border border-black"/>
                    </button>
                </div>

                <nav
                    className="flex items-stretch overflow-x-auto text-xs md:text-sm font-mono uppercase tracking-wider font-black">
                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className={`px-6 md:px-7 py-4 border-l-[2px] border-r-[2px] border-black flex items-center transition-colors ${
                            isHome
                                ? "bg-white text-brand-orange font-black shadow-[inset_0_-4px_0_#FF3E00]"
                                : "text-black hover:bg-brand-bgLight hover:text-brand-orange"
                        }`}
                    >
                        Create / Join meeting
                    </button>

                    {meetingId && onChangeStage && (
                        <>

                            {/*<button*/}
                            {/*  type="button"*/}
                            {/*  onClick={() => onChangeStage("welcome")}*/}
                            {/*  className={`px-6 md:px-7 py-4 border-r-[2px] border-black flex items-center transition-colors ${*/}
                            {/*    activeStage === "welcome"*/}
                            {/*      ? "bg-white text-brand-orange font-black shadow-[inset_0_-4px_0_#FF3E00]"*/}
                            {/*      : "text-black hover:bg-black hover:text-white"*/}
                            {/*  }`}*/}
                            {/*>*/}
                            {/*  Welcome Intro*/}
                            {/*</button>*/}
                            <button
                                type="button"
                                onClick={() => onChangeStage("bench")}
                                className={`px-6 md:px-7 py-4 border-r-[2px] border-black flex items-center transition-colors ${
                                    activeStage === "bench"
                                        ? "bg-white text-brand-orange font-black shadow-[inset_0_-4px_0_#FF3E00]"
                                        : "text-black hover:bg-brand-bgLight hover:text-brand-orange"
                                }`}
                            >
                                Availability
                            </button>
                        </>
                    )}

                    {onToggleHostMode && (
                        <button
                            type="button"
                            onClick={onToggleHostMode}
                            className="px-6 md:px-7 py-4 border-r-[2px] border-black text-black flex items-center hover:bg-brand-bgLight hover:text-brand-orange transition-colors"
                        >
                            User Type: {isHostMode ? "HOST" : "GUEST"}
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={handleCopyShareLink}
                        className="px-7 py-4 bg-brand-orange text-white font-black flex items-center hover:bg-brand-orangeDark transition-colors whitespace-nowrap"
                    >
                        {copied
                            ? "LINK COPIED"
                            : meetingId
                                ? "SHARE PAGE LINK"
                                : "COPY PAGE LINK"}
                    </button>
                </nav>
            </div>
        </header>
    );
}
