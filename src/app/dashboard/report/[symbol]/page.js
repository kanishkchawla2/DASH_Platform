'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ReportViewerPage() {
  const params = useParams();
  const symbol = params.symbol.toUpperCase();

  const [pack, setPack] = useState(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [audioTime, setAudioTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [rate, setRate] = useState(1);
  const audioRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/reports/${symbol}`);
        const data = await res.json();
        if (!res.ok || !data.pack) throw new Error(data.error || 'Report not found');
        setPack(data.pack);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [symbol]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="animate-spin mb-4 mx-auto h-8 w-8 rounded-full border-2 border-cyan-500 border-t-transparent" />
          <p className="text-sm text-slate-500">Loading {symbol} research pack...</p>
        </div>
      </div>
    );
  }

  if (error || !pack) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-slate-950">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4 text-slate-700">404</div>
          <h1 className="text-xl font-bold text-white mb-2">Report Not Found</h1>
          <p className="text-sm text-slate-400 mb-6">{error || `No research pack for ${symbol}`}</p>
          <Link href="/dashboard" className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-bold text-white hover:bg-cyan-400">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const slides = pack.slides || [];
  const slide = slides[slideIndex];
  const assetBase = `/api/assets/${symbol}/`;

  const audioPath = pack?.podcast?.audioPath || pack?.assets?.audio || '';
  const chapters = pack?.podcast?.chapters || [];

  function assetUrl(path) {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/api/')) return path;
    return assetBase + path;
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return '00:00';
    const total = Math.max(0, Math.floor(seconds));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function togglePlay() {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }

  function seekTo(time) {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setAudioTime(time);
      if (audioRef.current.paused) audioRef.current.play().catch(() => {});
    }
    const ch = chapters.find(c => (c.startSeconds || 0) <= time && (!chapters.find(next => next.startSeconds > (c.startSeconds || 0)) || time < (chapters.find(next => next.startSeconds > (c.startSeconds || 0))?.startSeconds || Infinity)));
    if (ch?.slideId) {
      const idx = slides.findIndex(s => s.id === ch.slideId);
      if (idx >= 0) setSlideIndex(idx);
    }
  }

  function handleTimeUpdate() {
    if (audioRef.current) {
      setAudioTime(audioRef.current.currentTime);
      syncSlideToAudio();
    }
  }

  function syncSlideToAudio() {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime || 0;
    let active = chapters[0];
    for (const ch of chapters) {
      if ((ch.startSeconds || 0) <= current) active = ch;
    }
    if (active?.slideId) {
      const idx = slides.findIndex(s => s.id === active.slideId);
      if (idx >= 0 && idx !== slideIndex) setSlideIndex(idx);
    }
  }

  function handleSeek(e) {
    if (audioRef.current && audioDuration) {
      const time = (Number(e.target.value) / 100) * audioDuration;
      audioRef.current.currentTime = time;
      setAudioTime(time);
    }
  }

  function handleLoaded() {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration || 0);
    }
  }

  function changeSpeed(speed) {
    setRate(speed);
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }

  let currentChapter = null;
  for (const ch of chapters) {
    if ((ch.startSeconds || 0) <= audioTime) currentChapter = ch;
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-slate-950">
      {/* Sidebar */}
      <aside className="flex w-[300px] flex-shrink-0 flex-col border-r border-slate-800 bg-slate-900/50">
        <div className="border-b border-slate-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs text-cyan-400">
                <span className="font-mono font-bold">{pack.meta?.symbol}</span>
                <span>&middot;</span>
                <span>{pack.meta?.period}</span>
              </div>
              <h1 className="mt-1 text-base font-bold text-white">{pack.meta?.title}</h1>
              <p className="mt-1 text-xs text-slate-500">{pack.story?.oneLineThesis}</p>
            </div>
            <Link href="/dashboard" className="text-xs text-cyan-400 hover:text-cyan-300">&larr; Back</Link>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {slides.map((s, i) => (
            <button
              key={i}
              onClick={() => setSlideIndex(i)}
              className={`w-full rounded-lg border p-3 text-left transition ${
                i === slideIndex
                  ? 'border-cyan-500/50 bg-cyan-500/10'
                  : 'border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md border font-mono text-xs font-bold ${
                  i === slideIndex
                    ? 'border-cyan-500 bg-cyan-500 text-white'
                    : 'border-slate-700 bg-slate-800 text-cyan-400'
                }`}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white truncate">{s.title}</div>
                  <div className="text-xs text-slate-500 truncate">{s.kicker}</div>
                </div>
              </div>
            </button>
          ))}
        </nav>

        <div className="border-t border-slate-800 p-3 max-h-[140px] overflow-y-auto">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Sources ({pack.sourceRegistry?.length || 0})</h2>
          {(pack.sourceRegistry || []).map(src => (
            <a key={src.id} href={src.url} target="_blank" className="block text-xs text-slate-400 py-1 hover:text-cyan-400 truncate" rel="noreferrer">
              {src.id} &mdash; {src.label}
            </a>
          ))}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white">{pack.meta?.companyName} ({pack.meta?.symbol})</h2>
            <p className="text-xs text-slate-500">{pack.meta?.subtitle || 'Institutional Story Deck'}</p>
          </div>
          <div className="flex gap-2">
            {pack.assets?.audio && <a href={assetUrl(pack.assets.audio)} target="_blank" className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-slate-500" rel="noreferrer">Audio</a>}
            {pack.assets?.briefingNote && <a href={assetUrl(pack.assets.briefingNote)} target="_blank" className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-slate-500" rel="noreferrer">Briefing</a>}
            {pack.assets?.podcastScript && <a href={assetUrl(pack.assets.podcastScript)} target="_blank" className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-slate-500" rel="noreferrer">Script</a>}
            {pack.assets?.pptx && <a href={assetUrl(pack.assets.pptx)} target="_blank" className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-slate-500" rel="noreferrer">PPTX</a>}
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-1 mb-4">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setSlideIndex(i)}
              className={`h-1 flex-1 rounded-full transition ${i === slideIndex ? 'bg-cyan-500' : 'bg-slate-700 hover:bg-slate-600'}`}
            />
          ))}
        </div>

        {/* Slide nav */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <button onClick={() => setSlideIndex(Math.max(0, slideIndex - 1))} disabled={slideIndex === 0}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed">
              &larr; Prev
            </button>
            <button onClick={() => setSlideIndex(Math.min(slides.length - 1, slideIndex + 1))} disabled={slideIndex === slides.length - 1}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed">
              Next &rarr;
            </button>
          </div>
          <span className="font-mono text-xs text-slate-500">Slide {slideIndex + 1} of {slides.length}</span>
        </div>

        {/* Slide content */}
        {slide && (
          <div>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1">{slide.kicker}</p>
                <h1 className="text-3xl font-extrabold text-white">{slide.title}</h1>
              </div>
              <div className="flex flex-wrap gap-1 shrink-0">
                {collectSlideSources(slide, pack.sourceRegistry || []).map(id => {
                  const src = (pack.sourceRegistry || []).find(s => s.id === id);
                  return src ? (
                    <a key={id} href={src.url} target="_blank" className="rounded border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400 hover:text-cyan-400" rel="noreferrer">
                      {id}
                    </a>
                  ) : null;
                })}
              </div>
            </div>

            {slide.claim && (
              <p className="border-l-3 border-cyan-500 pl-4 mb-6 text-base leading-relaxed text-slate-300 italic">{slide.claim}</p>
            )}

            {slide.metricStrip?.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {slide.metricStrip.map((m, i) => (
                  <div key={i} className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{m.label || m.name || ''}</div>
                    <div className="mt-1 font-mono text-xl font-bold text-white">{m.value || m.val || ''}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                {(slide.narrative || []).map((p, i) => (
                  <p key={i} className="text-sm leading-relaxed text-slate-300 mb-3 last:mb-0">{p}</p>
                ))}
                {(!slide.narrative || slide.narrative.length === 0) && (
                  <p className="text-sm text-slate-500 italic">No narrative content.</p>
                )}
                {slide.quote && (
                  <div className="mt-4 border-l-3 border-cyan-500 bg-cyan-500/5 rounded-r-lg p-3 text-sm text-slate-300 italic">
                    {slide.quote.text}
                  </div>
                )}
              </div>

              <div>
                {slide.evidence?.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {slide.evidence.map((ev, i) => (
                      <div key={i} className="rounded-lg border border-slate-800 bg-slate-900/30 p-3">
                        {ev.label && <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">{ev.label}</div>}
                        {ev.value && <div className="mt-1 font-mono text-base font-bold text-white">{ev.value}</div>}
                        {ev.detail && <div className="mt-1 text-xs text-slate-400">{ev.detail}</div>}
                        {typeof ev === 'string' && <p className="text-xs text-slate-400">{ev}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bull/Bear */}
            {slide.debate && (
              <div className="grid gap-4 sm:grid-cols-2 mt-6">
                <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
                  <h3 className="text-sm font-bold text-green-400 mb-3">Bull Case</h3>
                  <ul className="space-y-2">
                    {(slide.debate.bull || slide.debate.bulls || []).map((item, i) => (
                      <li key={i} className="text-xs text-slate-300 bg-slate-900/50 rounded p-2">{typeof item === 'string' ? item : item.text}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
                  <h3 className="text-sm font-bold text-yellow-400 mb-3">Bear Case</h3>
                  <ul className="space-y-2">
                    {(slide.debate.bear || slide.debate.bears || []).map((item, i) => (
                      <li key={i} className="text-xs text-slate-300 bg-slate-900/50 rounded p-2">{typeof item === 'string' ? item : item.text}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Table */}
            {slide.table?.columns?.length > 0 && (
              <div className="mt-6 overflow-hidden rounded-lg border border-slate-800">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-800 bg-slate-900/80">
                    <tr>
                      {slide.table.columns.map((col, i) => (
                        <th key={i} className="px-3 py-2 text-[10px] font-bold uppercase text-slate-500">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(slide.table.rows || []).map((row, i) => (
                      <tr key={i} className="border-b border-slate-800/50 last:border-0">
                        {(Array.isArray(row) ? row : Object.values(row)).map((cell, j) => (
                          <td key={j} className="px-3 py-2 text-xs text-slate-300">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Podcast Player */}
        {audioPath && (
          <section className="mt-8 border-t border-slate-800 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Audio Briefing</div>
                <h2 className="text-lg font-bold text-white">{pack?.podcast?.title || 'Synthesized Podcast Briefing'}</h2>
              </div>
              <div className="text-xs text-slate-500">
                {audioDuration ? formatTime(audioDuration) : '--:--'}
              </div>
            </div>

            <audio
              ref={audioRef}
              src={assetUrl(audioPath)}
              preload="metadata"
              onLoadedMetadata={handleLoaded}
              onTimeUpdate={handleTimeUpdate}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
              className="hidden"
            />

            <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
              <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                <div className="flex items-center gap-4 mb-4">
                  <button onClick={togglePlay} className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500 text-white hover:bg-cyan-400 transition">
                    {playing ? (
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
                    ) : (
                      <svg className="h-5 w-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white truncate">{currentChapter?.title || currentChapter?.name || pack?.slides?.[slideIndex]?.title || 'Audio Briefing'}</div>
                    <div className="text-[10px] text-slate-500">{pack?.podcast?.turns?.length || 0} dialogue exchanges</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-slate-500 w-10 text-right">{formatTime(audioTime)}</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={audioDuration ? (audioTime / audioDuration) * 100 : 0}
                    onChange={handleSeek}
                    className="flex-1 h-1.5 rounded-full appearance-none bg-slate-700 accent-cyan-500 cursor-pointer"
                  />
                  <span className="font-mono text-[10px] text-slate-500 w-10">{formatTime(audioDuration)}</span>
                </div>

                <div className="flex gap-2 mt-3">
                  {[0.85, 1, 1.15, 1.3].map(s => (
                    <button
                      key={s}
                      onClick={() => changeSpeed(s)}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                        rate === s
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          : 'text-slate-500 border border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                <h3 className="text-xs font-bold text-white mb-3">Chapters</h3>
                {chapters.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No chapters available.</p>
                ) : (
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {chapters.map((ch, i) => (
                      <button
                        key={i}
                        onClick={() => seekTo(ch.startSeconds || 0)}
                        className={`w-full flex items-center gap-3 rounded px-2 py-1.5 text-left transition ${
                          currentChapter?.startSeconds === ch.startSeconds
                            ? 'bg-cyan-500/10 text-cyan-400'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <span className="font-mono text-[10px] shrink-0">{formatTime(ch.startSeconds || 0)}</span>
                        <span className="text-xs truncate">{ch.title || ch.name || ''}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function collectSlideSources(slide, registry) {
  const ids = new Set(slide.sourceIds || []);
  const push = (item) => item?.sourceIds?.forEach(id => ids.add(id));
  (slide.metricStrip || []).forEach(push);
  (slide.evidence || []).forEach(push);
  (slide.timeline || []).forEach(push);
  (slide.checklist || []).forEach(push);
  push(slide.quote);
  push(slide.chart);
  if (slide.debate) {
    (slide.debate.bull || slide.debate.bulls || []).forEach(push);
    (slide.debate.bear || slide.debate.bears || []).forEach(push);
  }
  return [...ids];
}
