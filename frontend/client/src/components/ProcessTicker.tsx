const TICKER_ITEMS = [
    "CLICK OR DRAG TO MARK",
    "SAVE AVAILABILITY",
    "SHARE LINK",
    ":|",
    ":)",
    "SCROLL GRID ON MOBILE",
] as const;

export default function ProcessTicker() {
    return (
        <div className="process-ticker py-2.5 font-mono text-[10px] md:text-xs font-bold uppercase tracking-widest select-none">
            <p className="px-4 md:px-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
                {TICKER_ITEMS.map((item, index) => (
                    <span key={item} className="inline-flex items-center gap-3">
                        {index > 0 && (
                            <span className="text-neutral-500" aria-hidden="true">
                                •
                            </span>
                        )}
                        <span>{item}</span>
                    </span>
                ))}
            </p>
        </div>
    );
}
