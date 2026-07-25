'use client';

import { useState, useEffect, useCallback } from 'react';

const FREE_LIMIT = 5;

export default function DashboardPage() {
  const [index, setIndex] = useState([]);
  const [packs, setPacks] = useState({});
  const [selected, setSelected] = useState(null);
  const [selectedPack, setSelectedPack] = useState(null);
  const [query, setQuery] = useState('');
  const [watchlist, setWatchlist] = useState([]);
  const [watchlistOnly, setWatchlistOnly] = useState(false);
  const [requests, setRequests] = useState([]);
  const [usage, setUsage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showRequest, setShowRequest] = useState(false);
  const [reqSymbol, setReqSymbol] = useState('');
  const [reqNotes, setReqNotes] = useState('');
  const [reqError, setReqError] = useState('');
  const [reqLoading, setReqLoading] = useState(false);
  const [reqSuccess, setReqSuccess] = useState(null);
  const [showSpotlight, setShowSpotlight] = useState(false);
  const [spotlightQuery, setSpotlightQuery] = useState('');

  useEffect(() => {
    async function loadIndex() {
      try {
        const res = await fetch('/research-packs/stocks.index.json');
        const idx = await res.json();
        setIndex(idx.packs || []);
      } catch (err) {
        console.error('Failed to load index:', err);
      }
    }
    async function loadRequests() {
      try {
        const [reqRes, usageRes] = await Promise.all([
          fetch('/api/requests'),
          fetch('/api/requests/usage'),
        ]);
        const reqData = await reqRes.json();
        let usageData = 0;
        try { const u = await usageRes.json(); usageData = u.count || 0; } catch {}
        setRequests(reqData.requests || []);
        setUsage(usageData);
      } catch (err) {
        console.error('Failed to load requests:', err);
      }
    }
    Promise.all([
      loadIndex(),
      loadRequests(),
    ]).finally(() => {
      const wl = JSON.parse(localStorage.getItem('dash_watchlist') || '[]');
      setWatchlist(wl);
      setLoading(false);
    });
  }, []);

  const toggleWatchlist = useCallback((symbol) => {
    setWatchlist(prev => {
      const next = prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol];
      localStorage.setItem('dash_watchlist', JSON.stringify(next));
      return next;
    });
  }, []);

  const filteredIndex = index.filter(item => {
    if (watchlistOnly && !watchlist.includes(item.symbol)) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return [item.symbol, item.companyName, item.brandName, item.summary, item.period]
      .filter(Boolean).join(' ').toLowerCase().includes(q);
  });

  async function loadPack(slug) {
    setSelected(slug);
    try {
      const res = await fetch(`/api/reports/${slug}`);
      const data = await res.json();
      setSelectedPack(data.pack);
    } catch {
      setSelectedPack(null);
    }
  }

  async function submitRequest(e) {
    e.preventDefault();
    setReqError('');
    setReqLoading(true);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: reqSymbol, notes: reqNotes }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === 'limit_reached') {
          setReqError(`You've used all ${FREE_LIMIT} free reports. Please subscribe.`);
        } else {
          setReqError(data.error || 'Request failed');
        }
        return;
      }
      setReqSuccess(data);
      const reqRes = await fetch('/api/requests');
      const reqData = await reqRes.json();
      setRequests(reqData.requests || []);
      const usageRes = await fetch('/api/requests/usage');
      const usageData = await usageRes.json();
      setUsage(usageData.count || 0);
    } catch (err) {
      setReqError(err.message);
    } finally {
      setReqLoading(false);
    }
  }

  // Keyboard shortcut for spotlight
  useEffect(() => {
    function handler(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSpotlight(true);
      }
      if (e.key === 'Escape') setShowSpotlight(false);
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-slate-500">Loading workspace...</div>;
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Sidebar */}
      <aside className="flex w-[340px] flex-shrink-0 flex-col border-r border-slate-800 bg-slate-900/50">
        <div className="border-b border-slate-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                DASH <span className="rounded border border-cyan-400/30 bg-cyan-400/10 px-1 text-[10px] font-semibold text-cyan-400">Terminal</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">Institutional equity research packs</p>
            </div>
            <div className="text-xs text-slate-500">
              <span className="text-cyan-400">{usage}</span>/{FREE_LIMIT}
            </div>
          </div>
        </div>

        <div className="border-b border-slate-800 p-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input
              type="search"
              placeholder="Search symbol or company..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelected(null); setSelectedPack(null); }}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="flex gap-1 border-b border-slate-800 bg-slate-900/30 p-2">
          <button onClick={() => setWatchlistOnly(false)} className={`flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition ${watchlistOnly ? 'text-slate-500 hover:text-white' : 'bg-slate-800 text-white'}`}>All Packs</button>
          <button onClick={() => setWatchlistOnly(true)} className={`flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition ${watchlistOnly ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'}`}>Watchlist</button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {filteredIndex.length === 0 && (
            <div className="flex h-32 items-center justify-center text-xs text-slate-600">No packs match your search.</div>
          )}
          <div className="space-y-1">
                {filteredIndex.map(item => (
              <div
                key={item.slug}
                role="button"
                tabIndex={0}
                onClick={() => loadPack(item.slug)}
                onKeyDown={(e) => { if (e.key === 'Enter') loadPack(item.slug); }}
                className={`w-full cursor-pointer rounded-lg border p-3 text-left transition ${
                  selected === item.slug
                    ? 'border-cyan-500/50 bg-cyan-500/10'
                    : 'border-slate-800 bg-slate-900/30 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-white">{item.symbol}</span>
                    <span
                      role="button"
                      tabIndex={-1}
                      onClick={(e) => { e.stopPropagation(); toggleWatchlist(item.symbol); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); toggleWatchlist(item.symbol); } }}
                      className={`cursor-pointer text-xs transition ${watchlist.includes(item.symbol) ? 'text-yellow-400' : 'text-slate-600 hover:text-yellow-400'}`}
                    >★</span>
                  </div>
                  <span className="rounded border border-cyan-400/20 bg-cyan-400/10 px-1.5 text-[10px] font-semibold text-cyan-400">{item.period}</span>
                </div>
                <div className="mt-1 text-xs font-semibold text-slate-300">{item.brandName || item.companyName}</div>
                <div className="mt-0.5 line-clamp-2 text-xs text-slate-500">{item.summary || ''}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-800 p-3">
          <button onClick={() => setShowRequest(true)} className="w-full rounded-lg bg-cyan-500 py-2 text-xs font-bold text-white transition hover:bg-cyan-400">
            + Request Report
          </button>
          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-600">
            <span>⌘K Search</span>
            <span>{filteredIndex.length} packs</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-950">
        {!selectedPack ? (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-lg text-center">
              <div className="text-4xl mb-4 opacity-20">
                <svg className="mx-auto h-16 w-16 text-cyan-500/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              </div>
              <h2 className="text-xl font-bold text-white">Welcome to DASH</h2>
              <p className="mt-2 text-sm text-slate-500">
                Select a research pack from the sidebar or press <kbd className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 font-mono text-xs">⌘K</kbd> to search.
              </p>
              <p className="mt-4 text-xs text-slate-600">
                Used <span className="text-cyan-400">{usage}</span> of {FREE_LIMIT} free reports this month.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="font-mono text-2xl font-bold text-white">{selectedPack.meta?.symbol}</h1>
                  <span className="rounded border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-xs font-semibold text-cyan-400">{selectedPack.meta?.exchange || 'NSE'}</span>
                  <button onClick={() => toggleWatchlist(selectedPack.meta?.symbol)} className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${watchlist.includes(selectedPack.meta?.symbol) ? 'border-green-500/30 bg-green-500/10 text-green-400' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                    {watchlist.includes(selectedPack.meta?.symbol) ? '★ Saved' : '☆ Save'}
                  </button>
                </div>
                <p className="mt-1 text-sm text-slate-400">{selectedPack.meta?.companyName} &middot; {selectedPack.meta?.period}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href={`/dashboard/report/${selectedPack.meta?.symbol}`}
                  className="rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-cyan-400"
                >
                  Open Deck
                </a>
                {selectedPack.assets?.audio && (
                  <a href={`/api/assets/${selectedPack.meta?.symbol}/${selectedPack.assets.audio}`} target="_blank" className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-slate-500">Audio</a>
                )}
                {selectedPack.assets?.briefingNote && (
                  <a href={`/api/assets/${selectedPack.meta?.symbol}/${selectedPack.assets.briefingNote}`} target="_blank" className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-slate-500">Briefing</a>
                )}
                {selectedPack.assets?.pptx && (
                  <a href={`/api/assets/${selectedPack.meta?.symbol}/${selectedPack.assets.pptx}`} target="_blank" className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-slate-500">PPTX</a>
                )}
              </div>
            </div>

            {/* Company Profile */}
            {selectedPack.companyProfile && (
              <section className="mb-6">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Company Profile</div>
                    <h2 className="text-lg font-bold text-white">Business Model & Sector Context</h2>
                  </div>
                  <span className="font-mono text-xs text-cyan-400">{selectedPack.meta?.sector}</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                    <h3 className="text-sm font-bold text-white">Core Business Model</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">{selectedPack.companyProfile.businessModel || selectedPack.story?.setup || 'Data pending.'}</p>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                    <h3 className="text-sm font-bold text-white">Sector Dynamics & Moat</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">{selectedPack.companyProfile.sectorContext || selectedPack.story?.centralQuestion || 'Data pending.'}</p>
                  </div>
                </div>
              </section>
            )}

            {/* Story Arc */}
            {selectedPack.story?.narrativeArc?.length > 0 && (
              <section className="mb-6">
                <div className="mb-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Narrative Structure</div>
                  <h2 className="text-lg font-bold text-white">Story Arc & Key Claims</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-4">
                  {selectedPack.story.narrativeArc.map((step, i) => (
                    <div key={i} className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                      <span className="font-mono text-xs font-bold text-cyan-400">0{i + 1}</span>
                      <h3 className="mt-2 text-sm font-bold text-white">{step.label}</h3>
                      <p className="mt-1 text-xs text-slate-400">{step.text}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Slides */}
            {selectedPack.slides?.length > 0 && (
              <section className="mb-6">
                <div className="mb-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Deck Overview</div>
                  <h2 className="text-lg font-bold text-white">Slides ({selectedPack.slides.length})</h2>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {selectedPack.slides.map((slide, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/50 p-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border border-slate-700 bg-slate-800 font-mono text-xs font-bold text-cyan-400">
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-white">{slide.title}</div>
                        <div className="text-xs text-slate-500">{slide.kicker || slide.claim || ''}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Sources */}
            {selectedPack.sourceRegistry?.length > 0 && (
              <section>
                <div className="mb-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Citation Provenance</div>
                  <h2 className="text-lg font-bold text-white">Source Registry ({selectedPack.sourceRegistry.length})</h2>
                </div>
                <div className="overflow-hidden rounded-lg border border-slate-800">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-800 bg-slate-900/80">
                      <tr>
                        <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">ID</th>
                        <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Source</th>
                        <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Type</th>
                        <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Date</th>
                        <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Link</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPack.sourceRegistry.map(src => (
                        <tr key={src.id} className="border-b border-slate-800/50 last:border-0">
                          <td className="px-3 py-2 font-mono text-xs text-cyan-400">{src.id}</td>
                          <td className="px-3 py-2 text-xs font-semibold text-white">{src.label}</td>
                          <td className="px-3 py-2 text-xs text-slate-500">{src.type}</td>
                          <td className="px-3 py-2 text-xs text-slate-500">{src.date || ''}</td>
                          <td className="px-3 py-2"><a href={src.url} target="_blank" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300">View &rarr;</a></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* Request Modal */}
      {showRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm" onClick={() => { if (!reqLoading) setShowRequest(false); }}>
          <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            {reqSuccess ? (
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                  <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M5 13l4 4L19 7"/></svg>
                </div>
                <h3 className="text-lg font-bold text-white">Report Queued!</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Research pack for <strong className="text-white">{reqSuccess.symbol}</strong> is being generated.
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {reqSuccess.remaining} free reports remaining this month.
                </p>
                <button onClick={() => { setShowRequest(false); setReqSuccess(null); setReqSymbol(''); setReqNotes(''); }} className="mt-4 w-full rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white">
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">Request Report</h2>
                  <button onClick={() => setShowRequest(false)} className="text-slate-500 hover:text-white">&times;</button>
                </div>
                <p className="mt-1 text-xs text-slate-500">Enter an NSE stock symbol to generate a research pack.</p>
                <form onSubmit={submitRequest} className="mt-4 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400">Stock Symbol</label>
                    <input
                      type="text"
                      required
                      value={reqSymbol}
                      onChange={e => setReqSymbol(e.target.value.toUpperCase())}
                      placeholder="e.g. INFY, ZOMATO, TATASTEEL"
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400">Focus Notes (Optional)</label>
                    <textarea
                      rows="3"
                      value={reqNotes}
                      onChange={e => setReqNotes(e.target.value)}
                      placeholder="e.g. Focus on Q4 EBITDA margin & capex pipeline..."
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                    />
                  </div>
                  {reqError && (
                    <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                      {reqError}
                      {reqError.includes('subscribe') && (
                        <a href="/pricing" className="ml-2 font-bold text-cyan-400 hover:text-cyan-300">View Plans &rarr;</a>
                      )}
                    </div>
                  )}
                  <button type="submit" disabled={reqLoading} className="w-full rounded-lg bg-cyan-500 py-2 text-sm font-bold text-white transition hover:bg-cyan-400 disabled:opacity-50">
                    {reqLoading ? 'Submitting...' : 'Submit Request'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Spotlight */}
      {showSpotlight && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/80 backdrop-blur-sm pt-[15vh]" onClick={() => setShowSpotlight(false)}>
          <div className="w-full max-w-xl rounded-xl border border-slate-800 bg-slate-900 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 border-b border-slate-800 p-4">
              <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input
                type="text"
                placeholder="Search any NSE stock..."
                value={spotlightQuery}
                onChange={e => setSpotlightQuery(e.target.value.toUpperCase())}
                autoFocus
                className="w-full bg-transparent text-lg font-semibold text-white outline-none placeholder:text-slate-600"
              />
            </div>
            <div className="max-h-[50vh] overflow-y-auto p-2">
              {spotlightQuery.length < 1 ? (
                <div className="p-4 text-center text-sm text-slate-600">Start typing to search stocks.</div>
              ) : (
                <div className="space-y-1">
                  {index.filter(item => item.symbol.includes(spotlightQuery) || (item.companyName || '').toUpperCase().includes(spotlightQuery)).slice(0, 12).map(item => (
                    <div
                      key={item.slug}
                      role="button"
                      tabIndex={0}
                      onClick={() => { loadPack(item.slug); setShowSpotlight(false); setSpotlightQuery(''); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') { loadPack(item.slug); setShowSpotlight(false); setSpotlightQuery(''); } }}
                      className="flex w-full cursor-pointer items-center justify-between rounded-lg px-4 py-3 text-left transition hover:bg-slate-800"
                    >
                      <div>
                        <div className="font-mono text-sm font-bold text-white">{item.symbol}</div>
                        <div className="text-xs text-slate-500">{item.brandName || item.companyName}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          role="button"
                          tabIndex={-1}
                          onClick={e => { e.stopPropagation(); toggleWatchlist(item.symbol); }}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); toggleWatchlist(item.symbol); } }}
                          className={`cursor-pointer text-sm ${watchlist.includes(item.symbol) ? 'text-yellow-400' : 'text-slate-600 hover:text-yellow-400'}`}
                        >★</span>
                      </div>
                    </div>
                  ))}
                  {index.filter(item => item.symbol.includes(spotlightQuery) || (item.companyName || '').toUpperCase().includes(spotlightQuery)).length === 0 && (
                    <div className="p-4 text-center text-sm text-slate-600">No matching stocks found.</div>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-4 border-t border-slate-800 bg-slate-900/80 px-4 py-2 text-[10px] text-slate-600">
              <span><kbd className="rounded border border-slate-700 bg-slate-800 px-1">↑</kbd> <kbd className="rounded border border-slate-700 bg-slate-800 px-1">↓</kbd> Navigate</span>
              <span><kbd className="rounded border border-slate-700 bg-slate-800 px-1">⏎</kbd> Open report</span>
              <span><kbd className="rounded border border-slate-700 bg-slate-800 px-1">Esc</kbd> Close</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
