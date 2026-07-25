export default function Footer() {
  return (
    <footer className="border-t border-slate-700/50 bg-slate-900/50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-400"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>
            <span>DASH Fundamentals &mdash; Institutional Equity Research Platform</span>
          </div>
          <p className="text-xs text-slate-600">
            Data sourced from NSE exchange filings. For informational purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
}
