export default function Footer() {
    return (
        <footer className="bg-brand-bgLight text-neutral-600 border-t border-technical">
            <div
                className="px-6 md:px-12 py-4 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-[10px] md:text-xs uppercase tracking-wider">
                <div>© 2026 LETTUCE-MEAT</div>
                <div className="text-center md:text-left text-neutral-700 normal-case max-w-xl">
                    Mark slots with :| (available) or :) (preferred)
                </div>
                <div className="text-brand-orange font-bold hidden md:block">Signal #FF3E00</div>
            </div>
        </footer>
    );
}
