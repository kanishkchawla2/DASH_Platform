import Link from 'next/link';

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-slate-900" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-400">
              Now in Private Beta
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
              Institutional Equity Research.
              <br />
              <span className="text-cyan-400">Generated On Demand.</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-400">
              DASH generates multi-slide story decks, synced audio podcasts, briefing notes, 
              and citation registries directly from NSE exchange filings and financial disclosures. 
              Request any stock symbol — get a complete research pack in minutes.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/login"
                className="rounded-lg bg-cyan-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-cyan-400"
              >
                Get Started Free
              </Link>
              <Link
                href="/pricing"
                className="rounded-lg border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white"
              >
                See Pricing
              </Link>
            </div>
            <p className="mt-4 text-xs text-slate-600">
              5 free reports included. No credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="border-b border-slate-800 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-white sm:text-3xl">How It Works</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-slate-400">
            From request to research pack in three simple steps.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              { step: '01', title: 'Submit a Symbol', desc: 'Enter any NSE stock symbol — INFY, ZOMATO, TATASTEEL. Add focus notes if needed.' },
              { step: '02', title: 'Agentic Extraction', desc: 'Our research agents parse financial disclosures, concall transcripts, and investor presentations into structured JSON contracts.' },
              { step: '03', title: 'Get Your Pack', desc: 'Receive a complete research pack with story deck, audio briefing, briefing note, and citation registry.' },
            ].map((item) => (
              <div key={item.step} className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                <span className="font-mono text-sm font-bold text-cyan-400">{item.step}</span>
                <h3 className="mt-3 text-lg font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-slate-800 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">What You Get</h2>
            <p className="mt-4 text-slate-400">Every research pack ships with these assets.</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: 'Story Deck', desc: 'Multi-slide narrative deck covering business model, financials, bull/bear debate, and key metrics.' },
              { title: 'Audio Briefing', desc: 'Synthesized podcast with chapter timestamps. Listen on the go.' },
              { title: 'Briefing Note', desc: 'Concise 1-page executive summary of the investment thesis.' },
              { title: 'Citation Registry', desc: 'Every claim backed by source documents from NSE exchange filings.' },
              { title: 'PPTX Export', desc: 'Download the deck as a PowerPoint presentation.' },
              { title: 'Watchlist', desc: 'Track your favorite stocks and get quick access to their research packs.' },
            ].map((feature) => (
              <div key={feature.title} className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                <h3 className="font-bold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Ready to Get Started?</h2>
          <p className="mt-4 text-slate-400">
            Join the private beta. Your first 5 reports are on us.
          </p>
          <div className="mt-8">
            <Link
              href="/login"
              className="rounded-lg bg-cyan-500 px-8 py-3 text-sm font-bold text-white transition hover:bg-cyan-400"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
